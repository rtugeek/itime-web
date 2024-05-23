import localforage from 'localforage'
import { nanoid } from 'nanoid'
import type { PomodoroScene } from '@/data/PomodoroScene'
import { DefaultScenes } from '@/data/PomodoroScene'

const pomodoroSceneRepository = localforage.createInstance({ name: 'pomodoro-scene' })
export class PomodoroSceneRepository {
  static async get(key: string) {
    return pomodoroSceneRepository.getItem<PomodoroScene>(key)
  }

  static async save(value: PomodoroScene) {
    if (!value.id) {
      value.id = nanoid()
    }
    if (!value.createTime) {
      value.createTime = new Date()
    }
    value.updateTime = new Date()
    return pomodoroSceneRepository.setItem(value.id, value)
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
        return a.createTime.getTime() - b.createTime.getTime()
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
