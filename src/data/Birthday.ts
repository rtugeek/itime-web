export interface Birthday {
  tableId?: number
  /**
   * 本地唯一标识
   */
  id: number
  userId?: number
  name: string
  year: number
  /**
   * 负数代表闰月
   * 从1开始
   */
  month: number
  /**
   * 从1开始
   */
  dayOfMonth: number
  /**
   * 0-公历
   * 1-农历
   */
  dateType: number
  /**
   * ISO 8601 date string
   */
  createTime: string
  /**
   * ISO 8601 date string
   */
  updateTime: string

  introduction: string

  single_event: boolean

}
