export class BaseData {
  /**
   * 本地id
   */
  id?: string | number
  userId?: number | string
  /**
   * UUID 标识符，用于跨系统唯一标识实体，由服务器创建
   */
  uuid?: string
  createTime?: Date
  updateTime?: Date
  deleteTime?: Date
  needSync?: boolean
  /** itime 数字业务 ID；保留本地 ID，避免破坏已有组件引用。 */
  syncId?: number
  /** 已确认的服务器版本；用于区分远端删除和本地新建。 */
  lastSyncedAt?: Date
  /** 已确认的远端字段快照，兼容没有更新时间的接口。 */
  syncVersion?: string
}

export interface BaseRemoteData {
  /**
   * 本地id
   */
  id?: string | number
  userId?: number | string
  /**
   *  UUID 标识符，用于跨系统唯一标识实体，由服务器创建
   */
  uuid?: string
  createTime: string
  updateTime: string
  deleteTime?: string
}
