import type { BaseData } from '@/data/base/BaseData'

export interface PomodoroHistory extends BaseData {
  id: number
  duration: number
  sceneId: number | string
  userId?: number
  finishTime: string
  startTime: string
  needSync?: boolean
}
