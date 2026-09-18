import { expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({ items: new Map<string, any>(), fail: false }))
vi.mock('@/data/repository/UserDataRepository', () => ({ UserDataRepository: {
  findOne: async ({ id }: any) => structuredClone(state.items.get(id)),
  findByDataType: async (type: string, removed: boolean) => structuredClone([...state.items.values()].filter(it => it.dataType === type && (removed || !it.deleteTime))),
  save: async (item: any, needSync: boolean, preserveTime: boolean) => {
    if (state.fail) {
      state.fail = false
      throw new Error('storage failed')
    }
    const saved = structuredClone({ ...item, needSync, updateTime: preserveTime ? item.updateTime : new Date().toISOString() })
    state.items.set(item.id, saved)
    return saved
  },
  remove: async (id: string) => { state.items.delete(id) },
  softRemove: async (id: string) => { Object.assign(state.items.get(id), { deleteTime: new Date().toISOString(), needSync: true }) },
} }))

it('keeps one string id when saving and editing', async () => {
  const { CountdownEventRepository: repo } = await import('@/data/repository/CountdownEventRepository')
  const { CountdownEvent } = await import('@/data/CountdownEvent')
  const original = new CountdownEvent('first', new Date())
  const saved = await repo.save(original)
  await repo.save(Object.assign(saved, { name: 'edited' }))
  expect((await repo.get(saved.id!))?.name).toBe('edited')
  expect(saved.id).toMatch(/^[\w-]{21}$/)
  expect(state.items.size).toBe(1)
})

it('updates modification times and marks reordered countdowns for upload', async () => {
  const { CountdownEventRepository: repo } = await import('@/data/repository/CountdownEventRepository')
  const { CountdownEvent } = await import('@/data/CountdownEvent')
  const previousTime = new Date('2020-01-01T00:00:00Z')
  const events = ['second', 'first'].map((name, sortOrder) => CountdownEvent.fromObject({
    name,
    sortOrder,
    updateTime: previousTime,
    needSync: false,
  }))
  const saved = await repo.saveAll(events)
  for (const [index, event] of saved.entries()) {
    const stored = await repo.get(event.id!)
    expect(stored?.sortOrder).toBe(index)
    expect(stored?.needSync).toBe(true)
    expect(stored!.updateTime!.getTime()).toBeGreaterThan(previousTime.getTime())
  }
})
