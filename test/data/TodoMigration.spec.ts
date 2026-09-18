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
    const saved = structuredClone({ ...item, needSync, updateTime: preserveTime ? item.updateTime : new Date() })
    state.items.set(item.id, saved)
    return saved
  },
} }))

it('keeps one string id when saving and editing', async () => {
  const { TodoRepository: repo } = await import('@/data/repository/TodoRepository')
  const { TodoUtils } = await import('@/utils/TodoUtils')
  const original = TodoUtils.new('first')
  const saved = await repo.save(original)
  await repo.save({ ...saved, title: 'edited' })
  expect((await repo.findOne({ id: saved.id! }))?.title).toBe('edited')
  expect(saved.id).toMatch(/^[\w-]{21}$/)
  expect(state.items.size).toBe(1)
})
