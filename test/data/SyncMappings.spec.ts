import { describe, expect, it, vi } from 'vitest'
import { TodoSync } from '@/data/sync/TodoSync'
import { PomodoroHistorySync } from '@/data/sync/PomodoroHistorySync'
import { PomodoroSceneSync } from '@/data/sync/PomodoroSceneSync'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'
import { TodoRepository } from '@/data/repository/TodoRepository'

vi.mock('@widget-js/core', () => ({ WidgetApi: {}, delay: vi.fn() }))
vi.mock('@/stores/useSupabaseStore', () => ({ useSupabaseStore: vi.fn() }))
vi.mock('@/data/repository/TodoRepository', () => ({ TodoRepository: { save: vi.fn(async item => item) } }))
vi.mock('@/data/repository/PomodoroHistoryRepository', () => ({ PomodoroHistoryRepository: { all: vi.fn().mockResolvedValue([]), save: vi.fn(async item => item) } }))
vi.mock('@/data/repository/PomodoroSceneRepository', () => ({ PomodoroSceneRepository: { all: vi.fn().mockResolvedValue([]), save: vi.fn(async item => item) } }))

describe('sync mappings and persistence', () => {
  it('restores Todo deletion, priority and reminder state', async () => {
    const time = '2026-01-01T00:00:00Z'
    const [todo] = TodoSync.mapRemoteToLocal([{ id: 1, title: 'test', importance: 'high', is_reminder_on: true, create_time: time, update_time: time, delete_time: time }])
    expect(todo).toMatchObject({ importance: 'high', isReminderOn: true, deleteTime: new Date(time) })
    await TodoSync.saveItem(todo)
    expect(TodoRepository.save).toHaveBeenCalledWith(todo, false, true)
  })
  it('includes tombstones when syncing scenes and history', async () => {
    await PomodoroHistorySync.getLocalItems()
    await PomodoroSceneSync.getLocalItems()
    expect(PomodoroHistoryRepository.all).toHaveBeenCalledWith(true)
    expect(PomodoroSceneRepository.all).toHaveBeenCalledWith(true)
  })
  it('downloads a scene as clean without changing its modification time', async () => {
    const time = '2026-01-01T00:00:00Z'
    const [scene] = PomodoroSceneSync.mapRemoteToLocal([{ id: '1', create_time: time, update_time: time }])
    await PomodoroSceneSync.saveItem(scene)
    expect(scene.needSync).toBe(false)
    expect(PomodoroSceneRepository.save).toHaveBeenCalledWith(scene, true)
    expect(scene.updateTime).toEqual(new Date(time))
  })
})
