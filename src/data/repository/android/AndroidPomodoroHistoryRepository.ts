import type { PomodoroHistory } from '@/data/PomodoroHistory'
import { AndroidApi } from '@/api/android/AndroidApi'
import type { IPomodoroHistoryRepository } from '@/data/repository/interface/IPomodoroHistoryRepository'

export class AndroidPomodoroHistoryRepository implements IPomodoroHistoryRepository {
  async get(id: string): Promise<PomodoroHistory | null> {
    return Promise.resolve(AndroidApi.request('AndroidPomodoroHistoryRepository', 'get', id.toString()))
  }

  async save(value: PomodoroHistory): Promise<PomodoroHistory> {
    return Promise.resolve(AndroidApi.request<PomodoroHistory>('AndroidPomodoroHistoryRepository', 'save', JSON.stringify(value))!)
  }

  async remove(key: number) {
    AndroidApi.request('AndroidPomodoroHistoryRepository', 'remove', key.toString())
  }

  async softRemove(history: PomodoroHistory) {
    await this.remove(history.id)
  }

  async removeBySceneId(sceneId: number | string) {
    AndroidApi.request('AndroidPomodoroHistoryRepository', 'removeBySceneId', sceneId.toString())
  }

  async all(): Promise<PomodoroHistory[]> {
    const result = AndroidApi.request<PomodoroHistory[]>('AndroidPomodoroHistoryRepository', 'all')
    if (result == null) {
      return []
    }
    return Promise.resolve(result)
  }

  async clear() {
    AndroidApi.request('AndroidPomodoroHistoryRepository', 'clear')
  }

  async findBySceneId(sceneId: number | string): Promise<PomodoroHistory[]> {
    return Promise.resolve(AndroidApi.request('AndroidPomodoroHistoryRepository', 'findBySceneId', sceneId.toString())!)
  }
}
