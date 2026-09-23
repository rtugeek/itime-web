import { beforeEach, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'

const storage = vi.hoisted(() => ({ items: new Map<string, any>(), fail: false }))
vi.mock('localforage', () => ({ default: { createInstance: () => ({
  setItem: async (key: string, value: unknown) => {
    if (storage.fail) { throw new Error('storage failed') }
    // IndexedDB uses structured cloning, which rejects Vue proxies.
    const saved = structuredClone(value)
    storage.items.set(key, saved)
    return saved
  },
  getItem: async (key: string) => structuredClone(storage.items.get(key)),
  keys: async () => [...storage.items.keys()],
}) } }))

beforeEach(() => {
  storage.items.clear()
  storage.fail = false
})

function history() {
  return reactive({ id: 123, sceneId: 'scene', duration: 60, startTime: '2026-09-23T00:00:00Z', finishTime: '2026-09-23T00:01:00Z' })
}

it('persists reactive records and hides deleted records while retaining the sync tombstone', async () => {
  const record = history()
  await PomodoroHistoryRepository.save(record)
  expect(await PomodoroHistoryRepository.findBySceneId('scene')).toHaveLength(1)
  await PomodoroHistoryRepository.softRemove(record)
  expect(await PomodoroHistoryRepository.findBySceneId('scene')).toEqual([])
  expect(await PomodoroHistoryRepository.all()).toEqual([])
  expect(await PomodoroHistoryRepository.get('123')).toMatchObject({ deleteTime: expect.any(Date), needSync: true })
})

it('leaves the original record intact when deletion cannot be persisted', async () => {
  const record = history()
  await PomodoroHistoryRepository.save(record)
  storage.fail = true
  await expect(PomodoroHistoryRepository.softRemove(record)).rejects.toThrow('storage failed')
  expect(record).not.toHaveProperty('deleteTime')
  expect(await PomodoroHistoryRepository.findBySceneId('scene')).toHaveLength(1)
})
