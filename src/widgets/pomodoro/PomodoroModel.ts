export type PomodoroStatus = 'stop' | 'running' | 'pause'
export interface PomodoroModel {
  startAt?: Date
  finishAt?: Date
  pauseAt?: Date
  /**
   * 单位秒
   */
  totalDuration: number
  status: PomodoroStatus
  /**
   * 单位秒
   */
  pauseDuration: number
}
