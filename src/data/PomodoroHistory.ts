export interface PomodoroHistory {
  tableId?: string
  id: string
  duration: number
  finishAt: Date
  startAt: Date
  userId?: number
  createAt: Date
  sceneId: string
  deleteAt?: Date
  updateAt: Date
}
