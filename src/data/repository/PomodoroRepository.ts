import localforage from 'localforage'
import type { PomodoroHistory } from '@/data/PomodoroHistory'

const pomodoroRepository = localforage.createInstance({ name: 'pomodoro' })
export class PomodoroRepository {
  static async get(key: string) {
    return pomodoroRepository.getItem<PomodoroHistory>(key)
  }

  static async set(key: string, value: PomodoroHistory) {
    return pomodoroRepository.setItem(key, value)
  }

  static async remove(key: string) {
    return pomodoroRepository.removeItem(key)
  }

  static async clear() {
    return pomodoroRepository.clear()
  }
}
