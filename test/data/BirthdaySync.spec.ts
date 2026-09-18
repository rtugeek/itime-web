import { beforeEach, expect, it, vi } from 'vitest'
import { UserDataSync } from '@/data/sync/UserDataSync'
import { UserDataApi } from '@/api/UserDataApi'
import { AppConfig } from '@/common/AppConfig'

const state = vi.hoisted(() => ({ items: new Map<string, any>(), user: { userId: 1, isLogin: true } }))
vi.mock('@widget-js/core', () => ({ WidgetApi: { updateSyncInfo: async () => {} }, delay: vi.fn() }))
vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => state.user }))
vi.mock('@/api/UserDataApi', () => ({ UserDataApi: { list: vi.fn(), create: vi.fn(), update: vi.fn(), softDelete: vi.fn() } }))
vi.mock('@/data/repository/UserDataRepository', () => ({ UserDataRepository: {
  findAll: async () => structuredClone([...state.items.values()]),
  save: async (item: any, needSync: boolean, preserveTime: boolean) => {
    expect(preserveTime).toBe(true)
    const saved = structuredClone({ ...item, needSync })
    state.items.set(item.id, saved)
    return structuredClone(saved)
  },
} }))
const stamp = '2026-09-11T01:00:00.000Z'
const data = { name: '生日', year: 2001, month: -4, dayOfMonth: 3, dateType: 1, introduction: '备注' }
function remote(id = 'birthday-id') { return { id, userId: 1, dataType: 'birthday', data, sortOrder: 0, createTime: stamp, updateTime: stamp } }
function local() { return { ...remote(), createTime: new Date(stamp), updateTime: new Date(stamp), needSync: true } }
const run = () => (UserDataSync as any).syncLoggedIn()
beforeEach(() => {
  vi.resetAllMocks()
  state.items.clear()
  state.user.userId = 1
  localStorage.setItem(AppConfig.KEY_TOKEN, 'token')
  vi.mocked(UserDataApi.list).mockResolvedValue({ data: [], hasNext: false } as any)
  vi.mocked(UserDataApi.create).mockResolvedValue({ ...remote(), updateTime: '2026-09-11T02:00:00.000Z' } as any)
})
it('uploads lunar birthday payload without local metadata and restores Date timestamps', async () => {
  state.items.set('birthday-id', local())
  await run()
  expect(UserDataApi.create).toHaveBeenCalledWith({ id: 'birthday-id', dataType: 'birthday', data, searchText: '', sortOrder: 0 })
  expect(state.items.get('birthday-id')).toMatchObject({ needSync: false, updateTime: new Date('2026-09-11T02:00:00Z') })
})
it('downloads all pages before reconciling birthdays', async () => {
  vi.mocked(UserDataApi.list).mockResolvedValueOnce({ data: [remote()], hasNext: true } as any).mockResolvedValueOnce({ data: [remote('second')], hasNext: false } as any)
  await run()
  expect(state.items.size).toBe(2)
  expect(UserDataApi.list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, includeDeleted: true }))
})
it('retains failed deletions and retries the same string ID', async () => {
  state.items.set('birthday-id', { ...local(), deleteTime: new Date() })
  vi.mocked(UserDataApi.list).mockResolvedValue({ data: [remote()], hasNext: false } as any)
  vi.mocked(UserDataApi.softDelete).mockRejectedValueOnce(new Error('offline'))
  await expect(run()).rejects.toThrow('offline')
  expect(state.items.get('birthday-id').needSync).toBe(true)
  await run()
  expect(UserDataApi.softDelete).toHaveBeenLastCalledWith('birthday-id')
  expect(state.items.get('birthday-id').needSync).toBe(false)
})
it('acknowledges an absent local deletion without creating it remotely', async () => {
  state.items.set('birthday-id', { ...local(), deleteTime: new Date() })
  await run()
  expect(UserDataApi.create).not.toHaveBeenCalled()
  expect(UserDataApi.softDelete).not.toHaveBeenCalled()
  expect(state.items.get('birthday-id').needSync).toBe(false)
})
it('preserves edits made during birthday upload', async () => {
  state.items.set('birthday-id', local())
  vi.mocked(UserDataApi.create).mockImplementation(async () => {
    state.items.get('birthday-id').data.name = '新名字'
    return remote() as any
  })
  await run()
  expect(state.items.get('birthday-id')).toMatchObject({ data: { name: '新名字' }, needSync: true })
})
it('does not apply a partial download or infer a deletion from absence', async () => {
  state.items.set('birthday-id', { ...local(), needSync: false, lastSyncedAt: new Date(stamp) })
  vi.mocked(UserDataApi.list).mockResolvedValueOnce({ data: [], hasNext: true } as any).mockRejectedValueOnce(new Error('page failed'))
  await expect(run()).rejects.toThrow('page failed')
  expect(state.items.get('birthday-id').deleteTime).toBeUndefined()
  await run()
  expect(state.items.get('birthday-id').deleteTime).toBeUndefined()
})
it('stops persistence after an account switch', async () => {
  vi.mocked(UserDataApi.list).mockImplementation(async () => {
    state.user.userId = 2
    return { data: [remote()], hasNext: false } as any
  })
  await expect(run()).rejects.toThrow('账户已变更')
  expect(state.items.size).toBe(0)
})
