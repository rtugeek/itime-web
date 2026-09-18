import { beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { DefaultScenes } from '@/data/PomodoroScene'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'
import { usePomodoroStore } from '@/stores/usePomodoroStore'

const state = vi.hoisted(() => ({ user: { userId: undefined as number | undefined, isLogin: false } }))
vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => state.user }))
vi.mock('@widget-js/core', () => ({ NotificationApi: {} }))
vi.mock('@vueuse/core', () => ({
  useStorage: (_key: string, value: unknown) => ref(value),
  useEventListener: vi.fn(),
  useIntervalFn: () => ({ pause: vi.fn(), resume: vi.fn() }),
}))
vi.mock('@/common/broadcast/usePomodoroBroadcast', () => ({ usePomodoroBroadcast: () => ({ postEvent: vi.fn() }) }))
vi.mock('@/data/sync/UserDataSync', () => ({ UserDataSync: { sync: vi.fn(), revision: ref(0), busy: ref(false), error: ref('') } }))
vi.mock('@/data/sync/PomodoroHistorySync', () => ({ PomodoroHistorySync: { sync: vi.fn(), busy: ref(false), error: ref('') } }))
vi.mock('@/data/sync/PomodoroSnapshotSync', () => ({ pomodoroSyncRevision: ref(0) }))
vi.mock('@/data/repository/PomodoroHistoryRepository', () => ({ PomodoroHistoryRepository: {} }))
vi.mock('@/data/repository/UserDataRepository', () => ({ UserDataRepository: {
  findByDataType: vi.fn(),
  findOne: vi.fn(),
  save: vi.fn(),
} }))

beforeEach(() => {
  vi.resetAllMocks()
  setActivePinia(createPinia())
})

it.each([undefined, 123])('shows newly created default scenes for user %s', async (userId) => {
  state.user.userId = userId
  state.user.isLogin = userId !== undefined
  const { UserDataRepository } = await import('@/data/repository/UserDataRepository')
  const rows: any[] = []
  vi.mocked(UserDataRepository.findByDataType).mockImplementation(async () => [...rows])
  vi.mocked(UserDataRepository.save).mockImplementation(async (row) => {
    rows.push(row)
    return row
  })
  const store = usePomodoroStore()
  await flushPromises()
  await PomodoroSceneRepository.createDefaultScenes(DefaultScenes)
  await store.loadScenes()
  expect(store.scenes.map(scene => scene.name)).toEqual(DefaultScenes.map(scene => scene.name))

  rows.push({ ...rows[0], id: 'other-user', userId: 456 })
  rows.push({ ...rows[0], id: 'deleted', deleteTime: new Date() })
  await store.loadScenes()
  expect(store.scenes).toHaveLength(DefaultScenes.length)
})
