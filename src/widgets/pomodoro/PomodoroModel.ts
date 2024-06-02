/**
 * waiting - 等待提交
 * resting - 休息中
 */
export type PomodoroStatus = 'stop' | 'running' | 'pause' | 'waiting' | 'resting'
export interface PomodoroModel {
  startAt?: Date
  finishAt?: Date
  pauseAt?: Date
  createAt?: Date
  /**
   * 单位秒
   */
  duration: number
  /**
   * 休息时长
   */
  restDuration: number
  status: PomodoroStatus
}
