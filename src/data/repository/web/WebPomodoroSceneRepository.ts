import localforage from 'localforage'
import dayjs from 'dayjs'
import type { PomodoroScene } from '@/data/PomodoroScene'
import { DefaultScenes } from '@/data/PomodoroScene'
import type { IPomodoroSceneRepository } from '@/data/repository/interface/IPomodoroSceneRepository'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'

const pomodoroSceneRepository = localforage.createInstance({ name: 'pomodoro-scene' })

export class WebPomodoroSceneRepository implements IPomodoroSceneRepository {
  async get(key: string | number) {
    return pomodoroSceneRepository.getItem<PomodoroScene>(key.toString())
  }

  async save(value: PomodoroScene, preserveTime: boolean = false) {
    if (!value.id) {
      value.id = new Date().getTime() + Math.ceil(Math.random() * 1000)
    }
    if (!value.createTime) {
      value.createTime = new Date()
    }
    if (!preserveTime) { value.updateTime = new Date() }
    return pomodoroSceneRepository.setItem(value.id.toString(), value)
  }

  remove(id: string | number) {
    return pomodoroSceneRepository.removeItem(id.toString())
  }

  async softRemove(scene: PomodoroScene) {
    scene.deleteTime = new Date()
    scene.needSync = true
    await this.save(scene)
    return scene
  }

  clear() {
    return pomodoroSceneRepository.clear()
  }

  async all(includeRemoved: boolean = false): Promise<PomodoroScene[]> {
    const scenes: PomodoroScene[] = []
    const keys = await pomodoroSceneRepository.keys()
    // 迁移旧数据
    for (const oldId of keys) {
      if (Number.isNaN(Number.parseInt(oldId))) {
        const scene = await pomodoroSceneRepository.getItem<PomodoroScene>(oldId)
        if (scene) {
          const newId = new Date().getTime() + Math.ceil(Math.random() * 1000)
          scene.id = newId
          await pomodoroSceneRepository.setItem(scene.id.toString(), scene)
          await pomodoroSceneRepository.removeItem(oldId)
          PomodoroHistoryRepository.findBySceneId(oldId).then((result) => {
            for (const pomodoroHistory of result) {
              pomodoroHistory.sceneId = newId
              PomodoroHistoryRepository.save(pomodoroHistory)
            }
          })
        }
      }
    }
    for (const key of keys) {
      const scene = await pomodoroSceneRepository.getItem<PomodoroScene>(key)
      if (scene && (includeRemoved || !scene.deleteTime)) {
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

  async createDefaultScenes() {
    for (const defaultScene of DefaultScenes) {
      await this.save(defaultScene)
    }
  }
}
