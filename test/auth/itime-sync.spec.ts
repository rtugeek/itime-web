import { beforeEach, expect, it, vi } from 'vitest'
import { api } from '@/api/Api'
import { UserDataApi } from '@/api/UserDataApi'

vi.mock('@/api/Api', () => ({ api: { get: vi.fn(), delete: vi.fn() } }))
beforeEach(() => vi.resetAllMocks())
it('maps pagination and deletion filters to the unified list endpoint', async () => {
  await UserDataApi.list({ dataType: 'birthday', updatedSince: 123, includeDeleted: true, page: 2, size: 200 })
  expect(api.get).toHaveBeenCalledWith('/user/data', { params: { data_type: 'birthday', updated_since: 123, include_deleted: true, page: 2, size: 200 } })
})
it('encodes string IDs for reading and deleting unified records', async () => {
  await UserDataApi.get('id/with space')
  await UserDataApi.softDelete('id/with space')
  expect(api.get).toHaveBeenCalledWith('/user/data/id%2Fwith%20space')
  expect(api.delete).toHaveBeenCalledWith('/user/data/id%2Fwith%20space')
})
