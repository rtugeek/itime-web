export interface PomodoroHistory {
  tableId?: string
  id: number
  duration: number
  finishAt: Date
  startAt: Date
  userId?: number
  createAt: Date
  sceneId: number
  deleteAt?: Date
  updateAt: Date
}
