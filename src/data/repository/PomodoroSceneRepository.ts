import localforage from 'localforage'
import dayjs from 'dayjs'
import type { PomodoroScene } from '@/data/PomodoroScene'
import { DefaultScenes } from '@/data/PomodoroScene'

const pomodoroSceneRepository = localforage.createInstance({ name: 'pomodoro-scene' })
export class PomodoroSceneRepository {
  static async get(key: string | number) {
    return pomodoroSceneRepository.getItem<PomodoroScene>(key.toString())
  }

  static async save(value: PomodoroScene) {
    if (!value.id) {
      value.id = new Date().getTime() + Math.ceil(Math.random() * 1000)
    }
    if (!value.createTime) {
      value.createTime = new Date()
    }
    value.updateTime = new Date()
    return pomodoroSceneRepository.setItem(value.id.toString(), value)
  }

  static async remove(key: string) {
    return pomodoroSceneRepository.removeItem(key)
  }

  static async clear() {
    return pomodoroSceneRepository.clear()
  }

  static async all(): Promise<PomodoroScene[]> {
    const scenes: PomodoroScene[] = []
    const keys = await pomodoroSceneRepository.keys()
    for (const key of keys) {
      const scene = await pomodoroSceneRepository.getItem<PomodoroScene>(key)
      if (scene) {
        scenes.push(scene)
      }
    }
    // 根据创建时间排序
    scenes.sort((a, b) => {
      if (a.createTime && b.createTime) {
        return dayjs(a.createTime).toDate().getTime() - dayjs(b.createTime).toDate().getTime()
      }
      return 0
    })
    return scenes
  }

  static async createDefaultScenes() {
    for (const defaultScene of DefaultScenes) {
      await this.save(defaultScene)
    }
  }
}
