/**
 * waiting - 等待提交
 * resting - 休息中
 */
export type PomodoroStatus = 'stop' | 'running' | 'pause' | 'waiting' | 'resting'
export interface PomodoroModel {
  startAt?: string
  finishAt?: string
  pauseAt?: string
  createAt?: string
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
