import localforage from 'localforage'

const pomodoroRepository = localforage.createInstance({ name: 'pomodoro' })
export class PomodoroRepository {
  static async get(key: string) {
    return pomodoroRepository.getItem(key)
  }

  static async set(key: string, value: any) {
    return pomodoroRepository.setItem(key, value)
  }

  static async remove(key: string) {
    return pomodoroRepository.removeItem(key)
  }

  static async clear() {
    return pomodoroRepository.clear()
  }
}
