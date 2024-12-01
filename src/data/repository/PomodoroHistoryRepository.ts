import localforage from 'localforage'
import type { PomodoroHistory } from '@/data/PomodoroHistory'

const pomodoroRepository = localforage.createInstance({ name: 'pomodoro' })
export class PomodoroHistoryRepository {
  static async get(key: string) {
    return pomodoroRepository.getItem<PomodoroHistory>(key)
  }

  static async set(key: string, value: PomodoroHistory) {
    return pomodoroRepository.setItem(key, value)
  }

  static async save(value: PomodoroHistory) {
    if (!value.id) {
      value.id = new Date().getTime() + Math.ceil(Math.random() * 1000)
    }
    if (!value.createAt) {
      value.createAt = new Date()
    }
    value.updateAt = new Date()
    return pomodoroRepository.setItem(value.id.toString(), value)
  }

  static async remove(key: number) {
    return pomodoroRepository.removeItem(key.toString())
  }

  static async removeBySceneId(sceneId: number | string) {
    const keys = await pomodoroRepository.keys()
    for (const key of keys) {
      const history = await pomodoroRepository.getItem<PomodoroHistory>(key)
      if (history && history.sceneId === sceneId) {
        await pomodoroRepository.removeItem(key)
      }
    }
  }

  static async all(): Promise<PomodoroHistory[]> {
    const histories: PomodoroHistory[] = []
    const keys = await pomodoroRepository.keys()
    for (const key of keys) {
      const history = await pomodoroRepository.getItem<PomodoroHistory>(key)
      if (history) {
        histories.push(history)
      }
    }
    return histories
  }

  static async clear() {
    return pomodoroRepository.clear()
  }

  static async findBySceneId(sceneId: number | string): Promise<PomodoroHistory[]> {
    const histories: PomodoroHistory[] = []
    const keys = await pomodoroRepository.keys()
    for (const key of keys) {
      const history = await pomodoroRepository.getItem<PomodoroHistory>(key)
      if (history && history.sceneId === sceneId) {
        histories.push(history)
      }
    }
    return histories
  }
}
