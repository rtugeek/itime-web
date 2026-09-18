import { beforeEach, describe, expect, it, vi } from 'vitest'
import sample from '../../src/utils/itime-data-2026-09-18T03-50-22-644Z.json'
import { mapLegacyData, migrateLegacyData } from '@/utils/LegacyMigration'
import { UserDataRepository } from '@/data/repository/UserDataRepository'
import { clearMigratedStores, exportData, readExportData } from '@/utils/MigrateUtil'

vi.mock('@/utils/MigrateUtil', () => ({ readExportData: vi.fn(), exportData: vi.fn(), clearMigratedStores: vi.fn() }))
vi.mock('@/data/repository/UserDataRepository', () => ({
  UserDataRepository: { hasMigration: vi.fn(), importLegacy: vi.fn() },
}))

beforeEach(() => vi.resetAllMocks())

describe('legacy migration', () => {
  it('maps all four sample modules and preserves dates, completion, sorting and scene IDs', () => {
    const records = mapLegacyData(sample)
    expect(records).toHaveLength(sample.birthdays.length + sample.countdowns.length + sample.todos.length + sample.pomodoroScenes.length)
    expect(records[0]).toMatchObject({ id: String(sample.birthdays[0].id), dataType: 'birthday', needSync: true, createTime: new Date(sample.birthdays[0].createTime) })
    const todo = records.find(record => record.dataType === 'todo')!
    expect(todo).toMatchObject({ createTime: new Date(sample.todos[0].createdDateTime), sortOrder: sample.todos[0].order, data: { completedDateTime: new Date(sample.todos[0].completedDateTime!).toISOString() } })
    expect(todo.data).not.toHaveProperty('uuid')
    expect(records.find(record => record.dataType === 'pomodoro_scene')?.id).toBe(String(sample.pomodoroScenes[0].id))
  })

  it('preserves deleted records and their timestamps', () => {
    const deletedAt = '2026-09-18T00:00:00.000Z'
    expect(mapLegacyData({ ...sample, birthdays: [{ ...sample.birthdays[0], deleteTime: deletedAt }] })[0].deleteTime).toEqual(new Date(deletedAt))
  })

  it.each([[0, undefined], [3, 'RRULE:FREQ=DAILY;INTERVAL=3'], [-1, 'RRULE:FREQ=WEEKLY'], [-2, 'RRULE:FREQ=MONTHLY'], [-3, 'RRULE:FREQ=YEARLY']])('converts legacy recurrence %s', (periodType, expected) => {
    const records = mapLegacyData({ ...sample, countdowns: [{ ...sample.countdowns[0], periodType, recurrence: null }] })
    expect(records.find(record => record.dataType === 'countdown')?.data).toMatchObject({ recurrence: expected })
  })

  it('preserves existing recurrence and original countdown dates', () => {
    const countdown = { ...sample.countdowns[0], recurrence: 'RRULE:FREQ=MONTHLY;BYMONTHDAY=-1', periodType: -3, sourceDateTime: '2020-02-29T00:00:00.000Z', archiveTime: '2026-09-18T08:00:00+08:00' }
    expect(mapLegacyData({ ...sample, countdowns: [countdown] }).find(record => record.dataType === 'countdown')?.data).toMatchObject({ recurrence: countdown.recurrence, sourceDateTime: countdown.sourceDateTime, dateTime: countdown.dateTime, archiveTime: '2026-09-18T00:00:00.000Z' })
  })

  it('unwraps birthdays and keeps lunar leap months', () => {
    expect(mapLegacyData({ ...sample, birthdays: [{ birthday: { ...sample.birthdays[0], month: -8 } }] })[0].data).toMatchObject({ month: -8, dateType: 1 })
  })

  it('prefers Todo createdDateTime and keeps confirmed numeric accounts', () => {
    const todo = { ...sample.todos[0], createTime: '2026-01-01T00:00:00Z', userId: '123' }
    expect(mapLegacyData({ ...sample, todos: [todo] }).find(record => record.dataType === 'todo')).toMatchObject({ createTime: new Date(todo.createdDateTime), userId: 123 })
  })

  it.each([
    { createTime: 'broken' },
    { createTime: '2026-09-18' },
    { userId: 'old-account-uuid' },
    { sortOrder: -1 },
    { sortOrder: 65536 },
  ])('rejects invalid metadata instead of silently replacing it: %j', (metadata) => {
    expect(() => mapLegacyData({ ...sample, birthdays: [{ ...sample.birthdays[0], ...metadata }] })).toThrow()
  })

  it('rejects cross-module ID collisions', () => {
    expect(() => mapLegacyData({ ...sample, birthdays: [{ ...sample.birthdays[0], id: sample.todos[0].id }] })).toThrow('ID collision')
  })

  it('rejects invalid periodType and non-boolean reminder flags', () => {
    expect(() => mapLegacyData({ ...sample, countdowns: [{ ...sample.countdowns[0], periodType: -4 }] })).toThrow('periodType')
    expect(() => mapLegacyData({ ...sample, todos: [{ ...sample.todos[0], isReminderOn: 'false' }] })).toThrow('reminder')
  })

  it('does not read or download again after success', async () => {
    vi.mocked(UserDataRepository.hasMigration).mockResolvedValue(true)
    await migrateLegacyData()
    expect(readExportData).not.toHaveBeenCalled()
    expect(clearMigratedStores).not.toHaveBeenCalled()
  })

  it('exports before importing and stores the JSON backup', async () => {
    vi.mocked(readExportData).mockResolvedValue({ ...sample, pomodoroHistories: [] })
    await migrateLegacyData()
    expect(exportData).toHaveBeenCalledOnce()
    expect(readExportData).toHaveBeenCalledWith(true)
    expect(UserDataRepository.importLegacy).toHaveBeenCalledWith('legacy-stores-v1', expect.any(String), expect.any(Array))
    expect(vi.mocked(exportData).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(UserDataRepository.importLegacy).mock.invocationCallOrder[0])
    expect(clearMigratedStores).not.toHaveBeenCalled()
  })

  it('does not import when backup export fails', async () => {
    vi.mocked(readExportData).mockResolvedValue({ ...sample, pomodoroHistories: [] })
    vi.mocked(exportData).mockRejectedValue(new Error('backup failed'))
    await expect(migrateLegacyData()).rejects.toThrow('backup failed')
    expect(UserDataRepository.importLegacy).not.toHaveBeenCalled()
    expect(clearMigratedStores).not.toHaveBeenCalled()
  })

  it('does not clear legacy stores when import fails', async () => {
    vi.mocked(readExportData).mockResolvedValue({ ...sample, pomodoroHistories: [] })
    vi.mocked(UserDataRepository.importLegacy).mockRejectedValue(new Error('import failed'))
    await expect(migrateLegacyData()).rejects.toThrow('import failed')
    expect(clearMigratedStores).not.toHaveBeenCalled()
  })

  it('preserves old stores across repeated launches after migration', async () => {
    vi.mocked(UserDataRepository.hasMigration).mockResolvedValue(true)
    await migrateLegacyData()
    await migrateLegacyData()
    expect(clearMigratedStores).not.toHaveBeenCalled()
    expect(UserDataRepository.importLegacy).not.toHaveBeenCalled()
    expect(exportData).not.toHaveBeenCalled()
  })

  it('does not export or mark an empty installation', async () => {
    vi.mocked(readExportData).mockResolvedValue({ version: 1, exportedAt: new Date().toISOString(), birthdays: [], countdowns: [], todos: [], pomodoroScenes: [], pomodoroHistories: [] })
    await migrateLegacyData()
    expect(exportData).not.toHaveBeenCalled()
    expect(UserDataRepository.importLegacy).not.toHaveBeenCalled()
  })
})
