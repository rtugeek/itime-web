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
  softRemove: async (id: string) => {
    Object.assign(state.items.get(id), { deleteTime: new Date().toISOString(), needSync: true })
    return structuredClone(state.items.get(id))
  },
} }))

it('keeps one string id when saving and editing', async () => {
  const { PomodoroSceneRepository: repo } = await import('@/data/repository/PomodoroSceneRepository')
  const saved = await repo.save({ name: 'first', icon: 'x', duration: 60 })
  await repo.save({ ...saved, name: 'edited' })
  expect((await repo.get(saved.id!))?.name).toBe('edited')
  expect(saved.id).toMatch(/^[\w-]{21}$/)
  expect(state.items.size).toBe(1)
})
