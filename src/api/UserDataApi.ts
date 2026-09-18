import { api } from '@/api/Api'
import type { PageResult } from '@/api/ApiResult'
import type { RemoteUserData } from '@/data/UserData'

export interface UserDataCreateRequest<T = unknown> {
  id: string
  dataType: string
  data: T
  searchText?: string | null
  sortOrder?: number
}

export interface UserDataUpdateRequest<T = unknown> {
  id: string
  dataType: string
  data: T
  searchText?: string | null
  sortOrder?: number
}

export interface UserDataListParams {
  id?: string
  dataType?: string
  searchText?: string
  updatedSince?: number
  includeDeleted?: boolean
  page?: number
  size?: number
}

export const UserDataApi = {
  create<T = unknown>(body: UserDataCreateRequest<T>) {
    return api.post<unknown, RemoteUserData<T>>('/user/data', body)
  },

  update<T = unknown>(id: string, body: UserDataUpdateRequest<T>) {
    return api.put<unknown, RemoteUserData<T>>(`/user/data/${encodeURIComponent(id)}`, body)
  },

  softDelete(id: string) {
    return api.delete<unknown, void>(`/user/data/${encodeURIComponent(id)}`)
  },

  get<T = unknown>(id: string) {
    return api.get<unknown, RemoteUserData<T>>(`/user/data/${encodeURIComponent(id)}`)
  },

  list<T = unknown>(params: UserDataListParams = {}) {
    const query: Record<string, unknown> = {}
    if (params.dataType !== undefined) { query.data_type = params.dataType }
    if (params.id !== undefined) { query.id = params.id }
    if (params.searchText !== undefined) { query.search_text = params.searchText }
    if (params.updatedSince !== undefined) { query.updated_since = params.updatedSince }
    if (params.includeDeleted !== undefined) { query.include_deleted = params.includeDeleted }
    query.page = params.page ?? 1
    query.size = params.size ?? 200
    return api.get<unknown, PageResult<RemoteUserData<T>>>('/user/data', { params: query })
  },
}
