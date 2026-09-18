import type { BaseRemoteData } from '@/data/base/BaseData'

/**
 * 数据类型枚举
 */
export type UserDataType = 'birthday' | 'countdown' | 'todo' | string

/**
 * 本地使用的 UserData 接口（camelCase）
 */
export interface UserData<T = unknown> {
  /**
   * 服务器主键ID
   */
  id: string
  /**
   * 用户ID
   */
  userId: number
  /**
   * 数据类型，如 birthday/countdown/todo
   */
  dataType: UserDataType
  /**
   * 业务数据内容
   */
  data: T
  /**
   * 用户自定义排序，0-65535
   */
  sortOrder: number
  /**
   * 删除时间，未删除则为 null
   */
  deleteTime?: Date | null
  /**
   * 创建时间（本地 Date 对象）
   */
  createTime: Date
  /**
   * 更新时间（本地 Date 对象）
   */
  updateTime: Date

  needSync?: boolean
  lastSyncedAt?: Date
}

/**
 * 服务器返回的 UserData 接口（小驼峰）
 */
export interface RemoteUserData<T = unknown> extends Pick<BaseRemoteData, 'createTime' | 'updateTime' | 'deleteTime'> {
  /**
   * 主键ID
   */
  id: string
  /**
   * 用户ID
   */
  userId: number
  /**
   * 数据类型，如 birthday/countdown/todo
   */
  dataType: UserDataType
  /**
   * 业务数据内容
   */
  data: T
  /**
   * 用于搜索的冗余文本
   */
  searchText?: string | null
  /**
   * 用户自定义排序，0-65535
   */
  sortOrder: number
}

/**
 * 创建 UserData 实例的可选参数
 */
export interface UserDataOptions<T = unknown> {
  id: string
  userId: number
  dataType: UserDataType
  data: T
  searchText?: string
  sortOrder?: number
  deleteTime?: Date | null
  createTime?: Date
  updateTime?: Date
}
