import { beforeEach, expect, it, vi } from 'vitest'
import { UserDataSync } from '@/data/sync/UserDataSync'
import { UserDataApi } from '@/api/UserDataApi'
import { AppConfig } from '@/common/AppConfig'

const state = vi.hoisted(() => ({ items: new Map<string, any>(), user: { userId: 1, isLogin: true } }))
vi.mock('@widget-js/core', () => ({ WidgetApi: { updateSyncInfo: vi.fn(async () => {}) }, delay: vi.fn() }))
vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => state.user }))
vi.mock('@/api/UserDataApi', () => ({ UserDataApi: { list: vi.fn(), create: vi.fn(), update: vi.fn(), softDelete: vi.fn() } }))
vi.mock('@/data/repository/UserDataRepository', () => ({ UserDataRepository: {
  findAll: async () => structuredClone([...state.items.values()]),
  save: async (item: any, needSync: boolean) => {
    const saved = structuredClone({ ...item, needSync })
    state.items.set(item.id, saved)
    return saved
  },
} }))
const stamp = '2026-09-11T01:00:00.000Z'
function item(id: string, userId: number) { return { id, userId, dataType: 'todo', data: {}, sortOrder: 0, createTime: stamp, updateTime: stamp, needSync: true } }
const run = () => (UserDataSync as any).syncLoggedIn()
beforeEach(() => {
  vi.clearAllMocks()
  state.items.clear()
  state.user.userId = 1
  localStorage.setItem(AppConfig.KEY_TOKEN, 'token')
  vi.mocked(UserDataApi.list).mockResolvedValue({ data: [], hasNext: false } as any)
})
it('claims unbound data before upload and never uploads another user data', async () => {
  state.items.set('local', item('local', 0))
  state.items.set('other', item('other', 2))
  vi.mocked(UserDataApi.create).mockImplementation(async () => {
    expect(state.items.get('local').userId).toBe(1)
    return { ...item('local', 1) } as any
  })
  await run()
  expect(UserDataApi.create).toHaveBeenCalledOnce()
  expect(state.items.get('local')).toMatchObject({ userId: 1, needSync: false })
  expect(state.items.get('other')).toMatchObject({ userId: 2, needSync: true })
})
it('retains ownership after a failed upload, preventing upload under a second account', async () => {
  state.items.set('local', item('local', 0))
  vi.mocked(UserDataApi.create).mockRejectedValue(new Error('offline'))
  await expect(run()).rejects.toThrow('offline')
  expect(state.items.get('local').userId).toBe(1)
  state.user.userId = 2
  await run()
  expect(UserDataApi.create).toHaveBeenCalledOnce()
})
it('stops when the active userId changes during a request', async () => {
  state.items.set('local', item('local', 1))
  vi.mocked(UserDataApi.list).mockImplementation(async () => {
    state.user.userId = 2
    return { data: [], hasNext: false } as any
  })
  await expect(run()).rejects.toThrow('账户已变更')
  expect(UserDataApi.create).not.toHaveBeenCalled()
})
it('preserves an acknowledged countdown absent from an incremental response', async () => {
  const id = '4mnB9RxvtHjHErjIGMqB3'
  state.user.userId = 100294207
  const saved = { ...item(id, 100294207), dataType: 'countdown', needSync: false, deleteTime: null, lastSyncedAt: new Date('2026-09-11T23:19:18.472+08:00') }
  state.items.set(id, saved)
  await run()
  expect(state.items.get(id)).toEqual(saved)
  expect(UserDataApi.softDelete).not.toHaveBeenCalled()
})
it('applies an explicit remote tombstone from an incremental response', async () => {
  const saved = { ...item('local', 1), needSync: false, deleteTime: null, lastSyncedAt: new Date(stamp) }
  state.items.set('local', saved)
  const deletedAt = '2026-09-12T01:00:00.000Z'
  vi.mocked(UserDataApi.list).mockResolvedValue({ data: [{ ...saved, deleteTime: deletedAt, updateTime: deletedAt }], hasNext: false } as any)
  await run()
  expect(state.items.get('local')).toMatchObject({ deleteTime: new Date(deletedAt), needSync: false, lastSyncedAt: new Date(deletedAt) })
})

it('updates an acknowledged string id absent from the incremental response', async () => {
  const saved = { ...item('record-id', 1), lastSyncedAt: new Date(stamp) }
  state.items.set(saved.id, saved)
  vi.mocked(UserDataApi.update).mockResolvedValue(saved as any)
  await run()
  expect(UserDataApi.update).toHaveBeenCalledWith(saved.id, expect.objectContaining({ id: saved.id }))
  expect(UserDataApi.create).not.toHaveBeenCalled()
})
it('deletes an acknowledged string id absent from the incremental response', async () => {
  state.items.set('record-id', { ...item('record-id', 1), lastSyncedAt: new Date(stamp), deleteTime: stamp })
  await run()
  expect(UserDataApi.softDelete).toHaveBeenCalledWith('record-id')
})

it('downloads older cloud records even when local drafts or another account have newer timestamps', async () => {
  const draft = { ...item('draft', 1), updateTime: '2026-09-12T10:00:00Z' }
  const cloud = item('cloud', 1)
  state.items.set(draft.id, draft)
  state.items.set('other', { ...item('other', 2), updateTime: '2027-01-01T00:00:00Z' })
  vi.mocked(UserDataApi.list).mockImplementation(async params => ({
    data: !params?.updatedSince || Date.parse(cloud.updateTime) >= params.updatedSince ? [cloud] : [],
    hasNext: false,
  }) as any)
  vi.mocked(UserDataApi.create).mockResolvedValue(draft as any)
  await run()
  expect(state.items.get('cloud')).toMatchObject({ id: 'cloud', needSync: false })
})

it('preserves an edit after ownership persistence and before the upload starts', async () => {
  state.items.set('local', item('local', 1))
  const { UserDataRepository } = await import('@/data/repository/UserDataRepository')
  const originalSave = UserDataRepository.save
  const spy = vi.spyOn(UserDataRepository, 'save').mockImplementation(async (...args: any[]) => {
    const result = await (originalSave as any)(...args)
    if (args[1] && !state.items.get('local').data.edited) {
      state.items.set('local', { ...state.items.get('local'), data: { edited: true } })
    }
    return result
  })
  vi.mocked(UserDataApi.create).mockImplementation(async body => ({ ...item('local', 1), data: body.data }) as any)
  try {
    await run()
    expect(state.items.get('local')).toMatchObject({ data: { edited: true }, needSync: true })
    expect(UserDataApi.create).toHaveBeenCalledWith(expect.objectContaining({ data: {} }))
    vi.mocked(UserDataApi.update).mockImplementation(async (_id, body) => ({ ...item('local', 1), data: body.data }) as any)
    await run()
    expect(state.items.get('local')).toMatchObject({ data: { edited: true }, needSync: false })
  }
  finally { spy.mockRestore() }
})
