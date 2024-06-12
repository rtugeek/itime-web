import dayjs from 'dayjs'
import type { PomodoroScene } from '@/data/PomodoroScene'

export class PomodoroUtils {
  static getTotalHour(scene: PomodoroScene) {
    return dayjs.duration(scene.duration, 'seconds').asHours().toFixed(1)
  }
}
