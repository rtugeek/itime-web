import dayjs from 'dayjs'
import type { PomodoroHistory } from '@/data/PomodoroHistory'

export class PomodoroUtils {
  static getTotalHourStr(histories: PomodoroHistory[]) {
    const duration = histories.reduce((acc, cur) => acc + cur.duration, 0)
    return dayjs.duration(duration, 'seconds').asHours().toFixed(1)
  }

  static getTotalHour(histories: PomodoroHistory[]) {
    const duration = histories.reduce((acc, cur) => acc + cur.duration, 0)
    return dayjs.duration(duration, 'seconds').asHours()
  }
}
