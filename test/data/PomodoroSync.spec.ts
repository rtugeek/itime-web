import { beforeEach, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { PomodoroHistorySyncImpl } from '@/data/sync/PomodoroHistorySync'
import { UserDataSync } from '@/data/sync/UserDataSync'
import { api } from '@/api/Api'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'
import { AppConfig } from '@/common/AppConfig'

vi.mock('@widget-js/core', () => ({ WidgetApi: {}, delay: vi.fn() }))
vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => ({ userId: 1, isLogin: true }) }))
vi.mock('@/api/Api', () => ({ api: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } }))
vi.mock('@/data/sync/UserDataSync', () => ({ UserDataSync: { sync: vi.fn(), error: ref('') } }))
vi.mock('@/data/repository/PomodoroSceneRepository', () => ({ PomodoroSceneRepository: { get: vi.fn(async () => ({ id: 'scene-id', needSync: false, userId: 1 })) } }))
vi.mock('@/data/repository/PomodoroHistoryRepository', () => ({ PomodoroHistoryRepository: { all: vi.fn(), save: vi.fn() } }))
beforeEach(() => { vi.clearAllMocks() })
it('still uploads history through the original endpoint using the business sceneId', async () => {
  vi.mocked(api.post).mockImplementation(async (_url, data) => data as any)
  const sync = new PomodoroHistorySyncImpl()
  const history = { id: 9, sceneId: 'scene-id', startTime: '2026-09-11T01:00:00Z', finishTime: '2026-09-11T01:25:00Z', duration: 1500 }
  await sync.beforeSync()
  expect(UserDataSync.sync).toHaveBeenCalledOnce()
  await sync.beforeUpload(history)
  await sync.pushToRemote(sync.mapLocalToRemote([history]))
  expect(api.post).toHaveBeenCalledWith('/pomodoro/history', { id: 9, sceneId: 'scene-id', duration: 1500, startTime: history.startTime, name: history.finishTime })
})
it('still reads every history page without an updateTime filter', async () => {
  vi.mocked(api.get).mockResolvedValueOnce({ data: [{ id: 9, sceneId: 'scene-id', duration: 60, startTime: 'start', name: 'finish' }], hasNext: true }).mockResolvedValueOnce({ data: [], hasNext: false })
  const rows = await new PomodoroHistorySyncImpl().getRemoteItems()
  expect(rows[0]).toMatchObject({ sceneId: 'scene-id', finishTime: 'finish' })
  expect(api.get).toHaveBeenLastCalledWith('/pomodoro/history', { params: { page: 2, size: 100 } })
})

it('does not upload or delete histories belonging to another account', async () => {
  localStorage.setItem(AppConfig.KEY_TOKEN, 'token')
  const histories = [
    { id: 7, userId: 2, sceneId: 'other-scene', needSync: true },
    { id: 8, userId: 2, sceneId: 'other-scene', deleteTime: new Date(), needSync: true },
  ]
  vi.mocked(PomodoroHistoryRepository.all).mockResolvedValue(histories as any)
  vi.mocked(api.get).mockResolvedValue({ data: [{ id: 8, sceneId: 'other-scene', duration: 60, startTime: 'start' }], hasNext: false })
  await (new PomodoroHistorySyncImpl() as any).syncLoggedIn()
  expect(api.post).not.toHaveBeenCalled()
  expect(api.delete).not.toHaveBeenCalled()
  expect(PomodoroHistoryRepository.save).not.toHaveBeenCalled()
})
