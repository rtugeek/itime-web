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
   * 当前阶段(running/resting)开始时间 ISO。
   * 用于通过 (now - phaseStartAt) 计算当前阶段实时经过的秒数，
   * 不再依赖 setInterval 累加，避免多窗口叠加跳秒。
   */
  phaseStartAt?: string
  /**
   * 累计专注秒数（快照值）。
   * - running 状态：仅包含 pause 前已累计的部分，不包含当前阶段；真实时长需结合 phaseStartAt 计算。
   * - 非 running 状态：已完成的真实专注总秒数（保存历史时使用此值）。
   */
  duration: number
  /**
   * 累计休息秒数（快照值），语义同 duration。
   */
  restDuration: number
  status: PomodoroStatus
}
