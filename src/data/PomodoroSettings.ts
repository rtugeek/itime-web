export interface PomodoroSettings {
  /**
   * 单位分钟
   */
  pomoTime: number
  /**
   * 短休息 单位分钟
   */
  shortBreakTime: number
  /**
   *单位分钟
   */
  longBeakTime: number
  /**
   * 长间隔，默认4
   */
  longBreakSpan: number
  /**
   * 是否自动开始下一个番茄钟
   */
  isAutoNext: boolean
}

export function getDefaultPomodoroSettings(): PomodoroSettings {
  return {
    pomoTime: 30,
    shortBreakTime: 5,
    longBeakTime: 15,
    longBreakSpan: 4,
    isAutoNext: false,
  }
}
