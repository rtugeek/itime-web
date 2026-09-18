import { beforeEach, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { PomodoroSceneSyncImpl } from '@/data/sync/PomodoroSceneSync'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'
import { UserDataSync } from '@/data/sync/UserDataSync'

vi.mock('@/data/repository/PomodoroSceneRepository', () => ({ PomodoroSceneRepository: { migrateFromLegacy: vi.fn() } }))
vi.mock('@/data/sync/UserDataSync', () => ({ UserDataSync: { sync: vi.fn(), revision: ref(0), busy: ref(false), error: ref('') } }))
beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(PomodoroSceneRepository.migrateFromLegacy).mockResolvedValue()
})
it('migrates legacy scenes before unified synchronization and forwards options', async () => {
  vi.mocked(UserDataSync.sync).mockImplementation(async () => {
    expect(PomodoroSceneRepository.migrateFromLegacy).toHaveBeenCalledOnce()
  })
  const sync = new PomodoroSceneSyncImpl()
  await sync.sync({ delay: 0 })
  expect(UserDataSync.sync).toHaveBeenCalledWith({ delay: 0 })
  UserDataSync.revision.value++
  expect(sync.revision.value).toBe(UserDataSync.revision.value)
})
it('does not synchronize when migration fails', async () => {
  vi.mocked(PomodoroSceneRepository.migrateFromLegacy).mockRejectedValueOnce(new Error('storage failed'))
  await expect(new PomodoroSceneSyncImpl().sync()).rejects.toThrow('storage failed')
  expect(UserDataSync.sync).not.toHaveBeenCalled()
})
