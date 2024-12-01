import type { PomodoroScene } from '@/data/PomodoroScene'
import type { IPomodoroSceneRepository } from '@/data/repository/interface/IPomodoroSceneRepository'
import { AndroidPomodoroSceneRepository } from '@/data/repository/android/AndroidPomodoroSceneRepository'
import { WebPomodoroSceneRepository } from '@/data/repository/web/WebPomodoroSceneRepository'
import { AndroidApi } from '@/api/android/AndroidApi'

let targetApi: IPomodoroSceneRepository
if (AndroidApi.hasApi()) {
  targetApi = new AndroidPomodoroSceneRepository()
}
else {
  targetApi = new WebPomodoroSceneRepository()
}
export class PomodoroSceneRepositoryDelegate implements IPomodoroSceneRepository {
  async get(key: string | number) {
    return targetApi.get(key)
  }

  async save(value: PomodoroScene) {
    return targetApi.save(value)
  }

  remove(id: string | number) {
    return targetApi.remove(id)
  }

  clear() {
    return targetApi.clear()
  }

  async all(): Promise<PomodoroScene[]> {
    return targetApi.all()
  }

  async createDefaultScenes() {
    return targetApi.createDefaultScenes()
  }
}

export const PomodoroSceneRepository = new PomodoroSceneRepositoryDelegate()
