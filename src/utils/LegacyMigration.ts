import { exportData, readExportData } from './MigrateUtil'
import type { UserData } from '@/data/UserData'
import { UserDataRepository } from '@/data/repository/UserDataRepository'

const migrationId = 'legacy-stores-v1'
type RecordData = Record<string, unknown>
interface LegacyExport {
  exportedAt: string
  birthdays: RecordData[]
  countdowns: RecordData[]
  todos: RecordData[]
  pomodoroScenes: RecordData[]
}

function date(value: unknown, fallback: Date): Date {
  if (value == null || value === '') { return fallback }
  if (typeof value !== 'string' && typeof value !== 'number') { throw new TypeError(`Invalid legacy date: ${String(value)}`) }
  // A timezone-less string cannot be interpreted safely on another device.
  if (typeof value === 'string' && !/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)) { throw new Error(`Legacy date needs a timezone: ${value}`) }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) { throw new TypeError(`Invalid legacy date: ${String(value)}`) }
  return parsed
}

function recurrence(period: unknown): string | undefined {
  if (!Number.isInteger(period)) { throw new TypeError(`Invalid legacy periodType: ${String(period)}`) }
  const value = period as number
  if (value === 0) { return undefined }
  if (value > 0) { return `RRULE:FREQ=DAILY;INTERVAL=${value}` }
  const frequencies: Record<number, string> = { '-1': 'WEEKLY', '-2': 'MONTHLY', '-3': 'YEARLY' }
  if (!frequencies[value]) { throw new Error(`Invalid legacy periodType: ${value}`) }
  return `RRULE:FREQ=${frequencies[value]}`
}

/** Convert the JSON snapshot, keeping business fields separate from sync metadata. */
export function mapLegacyData(snapshot: LegacyExport): UserData[] {
  const groups = [
    ['birthday', snapshot.birthdays, ['name', 'year', 'month', 'dayOfMonth', 'dateType', 'introduction']],
    ['countdown', snapshot.countdowns, ['name', 'note', 'image', 'dateTime', 'sourceDateTime', 'dateType', 'recurrence', 'periodType', 'archiveTime']],
    ['todo', snapshot.todos, ['title', 'dueDateTime', 'reminderDateTime', 'completedDateTime', 'importance', 'recurrence', 'startDateTime', 'isReminderOn']],
    ['pomodoro_scene', snapshot.pomodoroScenes, ['name', 'icon', 'duration']],
  ] as const
  const ids = new Set<string>()
  return groups.flatMap(([dataType, records, fields]) => records.map((raw) => {
    const record = dataType === 'birthday' && raw.birthday && typeof raw.birthday === 'object' ? raw.birthday as RecordData : raw
    if (record.id == null || record.id === '') { throw new Error(`Missing legacy ${dataType} ID`) }
    if (typeof record.id !== 'string' && (typeof record.id !== 'number' || !Number.isSafeInteger(record.id))) { throw new TypeError(`Invalid legacy ${dataType} ID`) }
    const id = String(record.id)
    if (ids.has(id)) { throw new Error(`Legacy data ID collision: ${id}; ID mapping required`) }
    ids.add(id)
    const originalCreateTime = dataType === 'todo' ? record.createdDateTime ?? record.createTime : record.createTime
    const createTime = date(originalCreateTime ?? record.updateTime ?? record.lastModifiedDateTime, new Date(snapshot.exportedAt))
    const userId = record.userId == null || record.userId === '' ? 0 : Number(record.userId)
    if (record.userId != null && typeof record.userId !== 'string' && typeof record.userId !== 'number') { throw new Error('Invalid legacy account type') }
    if (!Number.isSafeInteger(userId) || userId < 0) { throw new Error(`Unresolved legacy account: ${String(record.userId)}`) }
    const sortOrder = Number(dataType === 'todo' ? record.order ?? 0 : record.sortOrder ?? 0)
    if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 65535) { throw new Error(`Invalid legacy sortOrder: ${sortOrder}`) }
    const data = Object.fromEntries(fields.filter(field => record[field] != null).map(field => [field, record[field]]))
    const titleField = dataType === 'todo' ? 'title' : 'name'
    if (typeof data[titleField] !== 'string') { throw new TypeError(`Missing legacy ${dataType} ${titleField}: ${id}`) }
    if (dataType === 'birthday') {
      data.introduction ??= ''
      if (![0, 1].includes(Number(data.dateType))
        || !Number.isInteger(data.year) || !Number.isInteger(data.month) || !Number.isInteger(data.dayOfMonth)
        || Math.abs(Number(data.month)) < 1 || Math.abs(Number(data.month)) > 12
        || Number(data.dayOfMonth) < 1 || Number(data.dayOfMonth) > 31
        || (data.dateType === 0 && Number(data.month) < 0)) { throw new Error(`Invalid legacy birthday: ${id}`) }
    }
    if (dataType === 'countdown') {
      data.note ??= ''
      data.periodType ??= 0
      data.sourceDateTime ??= data.dateTime
      if (!data.dateTime || !data.sourceDateTime) { throw new Error(`Missing legacy countdown date: ${id}`) }
      if (!data.recurrence) { data.recurrence = recurrence(data.periodType) }
      for (const field of ['dateTime', 'sourceDateTime', 'archiveTime']) {
        if (data[field] != null) { data[field] = date(data[field], createTime).toISOString() }
      }
    }
    if (dataType === 'todo') {
      data.isReminderOn ??= false
      if (typeof data.isReminderOn !== 'boolean') { throw new TypeError(`Invalid reminder flag: ${id}`) }
      if (data.importance != null && !['low', 'normal', 'high'].includes(String(data.importance))) { throw new Error(`Invalid importance: ${id}`) }
      for (const field of ['dueDateTime', 'reminderDateTime', 'completedDateTime', 'startDateTime']) {
        if (data[field] != null) { data[field] = date(data[field], createTime).toISOString() }
      }
    }
    if (dataType === 'pomodoro_scene') {
      data.duration ??= 0
      if (typeof data.duration !== 'number' || !Number.isFinite(data.duration) || data.duration < 0
        || typeof data.icon !== 'string') { throw new Error(`Invalid legacy scene: ${id}`) }
    }
    return {
      id,
      userId,
      dataType,
      data,
      sortOrder,
      createTime,
      updateTime: date(record.updateTime ?? record.lastModifiedDateTime, createTime),
      deleteTime: record.deleteTime ? date(record.deleteTime, createTime) : null,
      needSync: true,
    }
  }))
}

export async function migrateLegacyData(): Promise<void> {
  if (await UserDataRepository.hasMigration(migrationId)) {
    return
  }
  const snapshot = await readExportData(true)
  const json = JSON.stringify(snapshot, null, 2)
  if (![snapshot.birthdays, snapshot.countdowns, snapshot.todos, snapshot.pomodoroScenes].some(records => records.length)) { return }
  await exportData(snapshot)
  const records = mapLegacyData(JSON.parse(json))
  await UserDataRepository.importLegacy(migrationId, json, records)
}
