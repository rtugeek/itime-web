export interface TimeSpan {
  id: number
  duration?: number | null
  finishAt?: Date | null
  momentUuid: string
  startAt?: Date | null
  userId?: number | null
  uuid: string
  createAt?: Date
  deleteAt?: Date
  updateAt?: Date
}
