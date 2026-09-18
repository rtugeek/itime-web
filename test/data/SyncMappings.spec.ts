import { expect, it, vi } from 'vitest'
import { PomodoroHistorySync } from '@/data/sync/PomodoroHistorySync'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'

vi.mock('@widget-js/core', () => ({ WidgetApi: {}, delay: vi.fn() }))
vi.mock('@/stores/useUserStore', () => ({ useUserStore: vi.fn() }))
vi.mock('@/data/sync/PomodoroSceneSync', () => ({ PomodoroSceneSync: {} }))
vi.mock('@/data/repository/PomodoroHistoryRepository', () => ({ PomodoroHistoryRepository: { all: vi.fn().mockResolvedValue([]), save: vi.fn(async item => item) } }))
it('continues including history tombstones in the original sync', async () => {
  await PomodoroHistorySync.getLocalItems()
  expect(PomodoroHistoryRepository.all).toHaveBeenCalledWith(true)
})
