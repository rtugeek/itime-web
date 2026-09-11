import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BaseSync } from '@/data/sync/BaseSync'
import type { BaseData, BaseRemoteData } from '@/data/base/BaseData'

vi.mock('@widget-js/core', () => ({ WidgetApi: { updateSyncInfo: vi.fn().mockResolvedValue(undefined) }, delay: vi.fn().mockResolvedValue(undefined) }))
interface Item extends BaseData { title: string }
interface Remote extends BaseRemoteData { title: string }
const date = new Date('2026-01-01T00:00:00Z')
class Sync extends BaseSync<Item, Remote> {
  local: Item[] = [{ id: 1, title: 'first', updateTime: date, needSync: true }]
  remote: Remote[] = []
  push = vi.fn(async (items: Remote[]) => items.map(item => ({ ...item, uuid: 'uuid-1' })))
  constructor() { super('test') }
  async isLogin() { return true }
  async getLocalItems() { return structuredClone(this.local) }
  async getRemoteItems() { return this.remote }
  async pushToRemote(items: Remote[]) { return this.push(items) }
  async saveItem(item: Item, needSync = false) {
    const saved = { ...item, needSync }
    const index = this.local.findIndex(value => String(value.id) === String(item.id))
    if (index < 0) { this.local.push(saved) }
    else {
      this.local[index] = saved
    }
    return saved
  }

  mapLocalToRemote(items: Item[]): Remote[] {
    return items.map(item => ({ id: String(item.id), uuid: item.uuid, title: item.title, create_time: date.toISOString(), update_time: item.updateTime!.toISOString() }))
  }

  mapRemoteToLocal(items: Remote[]): Item[] {
    return items.map(item => ({ id: Number(item.id), uuid: item.uuid, title: item.title, updateTime: new Date(item.update_time) }))
  }
}
async function run(sync: Sync) {
  const result = sync.sync()
  await vi.runAllTimersAsync()
  await result
}
beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())
describe('sync data safety', () => {
  it('settles every debounced caller and uploads once', async () => {
    const sync = new Sync()
    const first = sync.sync()
    const second = sync.sync()
    await vi.runAllTimersAsync()
    await Promise.all([first, second])
    expect(sync.push).toHaveBeenCalledTimes(1)
    expect(sync.local[0].needSync).toBe(false)
  })
  it('keeps failed uploads dirty', async () => {
    const sync = new Sync()
    sync.push.mockResolvedValue([])
    await run(sync)
    expect(sync.local[0].needSync).toBe(true)
  })
  it('does not upload when remote reading fails', async () => {
    const sync = new Sync()
    sync.getRemoteItems = vi.fn().mockRejectedValue(new Error('offline'))
    await run(sync)
    expect(sync.push).not.toHaveBeenCalled()
    expect(sync.local[0].needSync).toBe(true)
  })
  it('preserves edits made while uploading and attaches returned identity', async () => {
    const sync = new Sync()
    sync.push.mockImplementation(async (items) => {
      sync.local[0] = { ...sync.local[0], title: 'edited', updateTime: new Date(date.getTime() + 1) }
      return items.map(item => ({ ...item, uuid: 'uuid-1' }))
    })
    await run(sync)
    expect(sync.local[0]).toMatchObject({ title: 'edited', needSync: true, uuid: 'uuid-1' })
  })
  it('runs another pass for requests received during an upload', async () => {
    const sync = new Sync()
    let next: Promise<void> | undefined
    sync.push.mockImplementationOnce(async (items) => {
      sync.local[0] = { ...sync.local[0], title: 'edited', updateTime: new Date(date.getTime() + 1) }
      next = sync.sync()
      return items.map(item => ({ ...item, uuid: 'uuid-1' }))
    })
    await run(sync)
    await next
    expect(sync.push).toHaveBeenCalledTimes(2)
    expect(sync.local[0]).toMatchObject({ title: 'edited', needSync: false })
  })
  it('matches numeric IDs with string IDs and preserves downloaded timestamps', async () => {
    const sync = new Sync()
    const updated = new Date(date.getTime() + 1000)
    sync.remote = [{ id: '1', uuid: 'uuid-1', title: 'remote', create_time: date.toISOString(), update_time: updated.toISOString() }]
    await run(sync)
    expect(sync.push).not.toHaveBeenCalled()
    expect(sync.local).toHaveLength(1)
    expect(sync.local[0]).toMatchObject({ title: 'remote', needSync: false, updateTime: updated })
  })
})
