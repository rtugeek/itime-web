export class BaseData {
  /**
   * 本地id
   */
  id?: string | number
  /**
   * UUID 标识符，用于跨系统唯一标识实体，由服务器创建
   */
  uuid?: string
  createTime?: Date
  updateTime?: Date
  deleteTime?: Date
  needSync?: boolean
}

export interface BaseRemoteData {
  /**
   * 本地id
   */
  id?: string | number
  /**
   *  UUID 标识符，用于跨系统唯一标识实体，由服务器创建
   */
  uuid?: string
  create_time: string
  update_time: string
  delete_time?: string
}
