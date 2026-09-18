import { beforeEach, expect, it, vi } from 'vitest'
import { UserDataRepository } from '@/data/repository/UserDataRepository'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'

const state = vi.hoisted(() => ({ data: new Map<string, any>(), history: new Map<string, any>(), upgrade: undefined as undefined | ((transaction: any) => Promise<void>) }))
vi.mock('dexie', () => ({ default: class {
  userDatas = {
    toArray: async () => structuredClone([...state.data.values()]),
    put: async (item: any) => state.data.set(item.id, structuredClone(item)),
  }

  version() {
    return { stores: () => {
      this.userDatas = {
        toArray: async () => structuredClone([...state.data.values()]),
        put: async (item: any) => state.data.set(item.id, structuredClone(item)),
      }
      return { upgrade: (callback: (transaction: any) => Promise<void>) => { state.upgrade = callback } }
    } }
  }
} }))
vi.mock('localforage', () => ({ default: { createInstance: () => ({
  keys: async () => [...state.history.keys()],
  getItem: async (key: string) => structuredClone(state.history.get(key)),
  setItem: async (key: string, item: any) => state.history.set(key, structuredClone(item)),
}) } }))

beforeEach(() => {
  state.data.clear()
  state.history.clear()
})

it('claims only guest data and preserves ownership, timestamps and acknowledgements on repeated logins', async () => {
  const stamp = '2026-09-11T01:00:00Z'
  const owned = { id: 'owned', userId: 1, updateTime: stamp, lastSyncedAt: stamp, needSync: false }
  state.data.set('owned', owned)
  state.data.set('guest', { id: 'guest', userId: 0, updateTime: stamp })
  await UserDataRepository.claimUnownedToUser(2)
  const claimed = structuredClone(state.data.get('guest'))
  expect(claimed).toMatchObject({ id: 'guest', userId: 2, updateTime: stamp, needSync: true })
  await UserDataRepository.claimUnownedToUser(2)
  await UserDataRepository.claimUnownedToUser(1)
  expect(state.data.get('owned')).toEqual(owned)
  expect(state.data.get('guest')).toEqual(claimed)
})

it('upgrades stored string timestamps without changing identity or sync state', async () => {
  const stamp = '2026-09-11T01:00:00.000Z'
  const rows = [
    { id: 'deleted', createTime: stamp, updateTime: stamp, deleteTime: stamp, needSync: false },
    { id: 'active', createTime: stamp, updateTime: stamp, deleteTime: null, needSync: true },
  ]
  await state.upgrade!({ table: () => ({ toCollection: () => ({ modify: async (convert: (row: any) => void) => rows.forEach(convert) }) }) })
  expect(rows[0]).toEqual({ id: 'deleted', createTime: new Date(stamp), updateTime: new Date(stamp), deleteTime: new Date(stamp), needSync: false })
  expect(rows[1]).toMatchObject({ id: 'active', createTime: new Date(stamp), updateTime: new Date(stamp), deleteTime: null, needSync: true })
})

it('converts server ISO strings to local Dates and serializes Dates back to ISO', () => {
  const stamp = '2026-09-11T01:00:00.000Z'
  const remote = { id: 'one', userId: 1, dataType: 'todo', data: {}, sortOrder: 0, createTime: stamp, updateTime: stamp, deleteTime: stamp }
  const [local] = UserDataRepository.mapRemoteToLocal([remote])
  expect(local).toMatchObject({ createTime: new Date(stamp), updateTime: new Date(stamp), deleteTime: new Date(stamp) })
  expect(UserDataRepository.mapLocalToRemote([local])[0]).toMatchObject(remote)
})

it('preserves history IDs and never reassigns previously owned histories', async () => {
  const owned = { id: 7, userId: 1, needSync: false, syncVersion: 'confirmed' }
  state.history.set('7', owned)
  state.history.set('8', { id: 8, userId: 0, updateTime: new Date('2026-09-11') })
  await PomodoroHistoryRepository.claimUnownedToUser(2)
  const claimed = structuredClone(state.history.get('8'))
  await PomodoroHistoryRepository.claimUnownedToUser(2)
  await PomodoroHistoryRepository.claimUnownedToUser(1)
  expect([...state.history.keys()]).toEqual(['7', '8'])
  expect(state.history.get('7')).toEqual(owned)
  expect(state.history.get('8')).toEqual(claimed)
  expect(claimed).toMatchObject({ id: 8, userId: 2, needSync: true, updateTime: new Date('2026-09-11') })
})
