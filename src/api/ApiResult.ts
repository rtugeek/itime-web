export interface ApiResult<T> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  data: T[]
  page: number
  size: number
  total: number
  hasNext: boolean
}
