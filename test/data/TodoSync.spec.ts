import { beforeEach, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { TodoSyncImpl } from '@/data/sync/TodoSync'
import { TodoRepository } from '@/data/repository/TodoRepository'
import { UserDataSync } from '@/data/sync/UserDataSync'

vi.mock('@/data/repository/TodoRepository', () => ({ TodoRepository: { migrateFromLegacy: vi.fn() } }))
vi.mock('@/data/sync/UserDataSync', () => ({ UserDataSync: { sync: vi.fn(), revision: ref(0), busy: ref(false), error: ref('') } }))
beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(TodoRepository.migrateFromLegacy).mockResolvedValue()
})
it('migrates legacy todos before unified synchronization and forwards options', async () => {
  vi.mocked(UserDataSync.sync).mockImplementation(async () => {
    expect(TodoRepository.migrateFromLegacy).toHaveBeenCalledOnce()
  })
  const sync = new TodoSyncImpl()
  await sync.sync({ delay: 0 })
  expect(UserDataSync.sync).toHaveBeenCalledWith({ delay: 0 })
  UserDataSync.revision.value++
  expect(sync.revision.value).toBe(UserDataSync.revision.value)
})
it('does not synchronize when migration fails', async () => {
  vi.mocked(TodoRepository.migrateFromLegacy).mockRejectedValueOnce(new Error('storage failed'))
  await expect(new TodoSyncImpl().sync()).rejects.toThrow('storage failed')
  expect(UserDataSync.sync).not.toHaveBeenCalled()
})
