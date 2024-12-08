export interface PomodoroHistory {
  tableId?: string
  id: number
  duration: number
  sceneId: number
  userId?: number
  /**
   * @deprecated
   */
  finishAt?: Date
  /**
   * @deprecated
   */
  updateAt?: Date
  /**
   * @deprecated
   */
  createAt?: Date
  /**
   * @deprecated
   */
  startAt?: Date
  finishTime: string
  startTime: string
  needSync?: boolean
}
