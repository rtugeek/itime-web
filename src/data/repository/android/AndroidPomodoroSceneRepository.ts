import type { PomodoroScene } from '@/data/PomodoroScene'
import type { IPomodoroSceneRepository } from '@/data/repository/interface/IPomodoroSceneRepository'
import { AndroidApi } from '@/api/android/AndroidApi'

export class AndroidPomodoroSceneRepository implements IPomodoroSceneRepository {
  get(id: string | number): Promise<PomodoroScene> {
    return AndroidApi.request('AndroidPomodoroSceneRepository', 'get', id.toString())!
  }

  async save(value: PomodoroScene): Promise<PomodoroScene> {
    return AndroidApi.request('AndroidPomodoroSceneRepository', 'save', JSON.stringify(value))!
  }

  remove(id: string | number): Promise<void> {
    return AndroidApi.request('AndroidPomodoroSceneRepository', 'remove', id.toString())!
  }

  clear(): Promise<void> {
    return AndroidApi.request('AndroidPomodoroSceneRepository', 'clear')!
  }

  async all(): Promise<PomodoroScene[]> {
    return AndroidApi.request('AndroidPomodoroSceneRepository', 'all')!
  }

  async createDefaultScenes(): Promise<void> {
    return AndroidApi.request('AndroidPomodoroSceneRepository', 'createDefaultScenes')!
  }
}
