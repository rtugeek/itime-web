export interface PomodoroHistory {
  tableId?: string
  id: number
  duration: number
  /**
   * @deprecated
   */
  finishAt: Date
  /**
   * @deprecated
   */
  startAt: Date
  userId?: number
  /**
   * @deprecated
   */
  createAt: Date
  sceneId: number
  /**
   * @deprecated
   */
  deleteAt?: Date
  /**
   * @deprecated
   */
  updateAt: Date
  finishTime: string
  startTime: string
  updateTime: string
  createTime: string
  deleteTime?: string
}
