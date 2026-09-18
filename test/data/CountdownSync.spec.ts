import { beforeEach, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { CountdownSyncImpl } from '@/data/sync/CountdownSync'
import { CountdownEventRepository } from '@/data/repository/CountdownEventRepository'
import { UserDataSync } from '@/data/sync/UserDataSync'

vi.mock('@/data/repository/CountdownEventRepository', () => ({ CountdownEventRepository: { migrateFromLegacy: vi.fn() } }))
vi.mock('@/data/sync/UserDataSync', () => ({ UserDataSync: { sync: vi.fn(), revision: ref(0), busy: ref(false), error: ref('') } }))
beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(CountdownEventRepository.migrateFromLegacy).mockResolvedValue()
})
it('migrates legacy countdowns before unified synchronization and forwards options', async () => {
  vi.mocked(UserDataSync.sync).mockImplementation(async () => {
    expect(CountdownEventRepository.migrateFromLegacy).toHaveBeenCalledOnce()
  })
  const sync = new CountdownSyncImpl()
  await sync.sync({ delay: 0 })
  expect(UserDataSync.sync).toHaveBeenCalledWith({ delay: 0 })
  UserDataSync.revision.value++
  expect(sync.revision.value).toBe(UserDataSync.revision.value)
})
it('does not synchronize when migration fails', async () => {
  vi.mocked(CountdownEventRepository.migrateFromLegacy).mockRejectedValueOnce(new Error('storage failed'))
  await expect(new CountdownSyncImpl().sync()).rejects.toThrow('storage failed')
  expect(UserDataSync.sync).not.toHaveBeenCalled()
})
