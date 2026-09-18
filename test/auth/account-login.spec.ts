import { beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '@/stores/useUserStore'
import { UserApi } from '@/api/UserApi'
import { UserDataRepository } from '@/data/repository/UserDataRepository'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'
import { UserDataSync } from '@/data/sync/UserDataSync'

vi.mock('@/api/UserApi', () => ({ UserApi: { loginByEmail: vi.fn() } }))
vi.mock('@/data/repository/UserDataRepository', () => ({ UserDataRepository: { claimUnownedToUser: vi.fn() } }))
vi.mock('@/data/repository/PomodoroHistoryRepository', () => ({ PomodoroHistoryRepository: { claimUnownedToUser: vi.fn() } }))
vi.mock('@/data/sync/UserDataSync', () => ({ UserDataSync: { sync: vi.fn() } }))
vi.mock('@/data/sync/PomodoroHistorySync', () => ({ PomodoroHistorySync: { sync: vi.fn() } }))

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  setActivePinia(createPinia())
})

it('uses guest-only claiming and synchronizes on account switches and same-account relogin', async () => {
  const store = useUserStore()
  for (const userId of [1, 2, 2]) {
    store.clearSession()
    vi.mocked(UserApi.loginByEmail).mockResolvedValue({ id: userId, accessToken: `token-${userId}` } as any)
    await store.loginByEmail('test@example.com', 'password')
    expect(UserDataRepository.claimUnownedToUser).toHaveBeenLastCalledWith(userId)
    expect(PomodoroHistoryRepository.claimUnownedToUser).toHaveBeenLastCalledWith(userId)
  }
  expect(UserDataSync.sync).toHaveBeenCalledTimes(3)
})
