import type { PomodoroScene } from '@/data/PomodoroScene'
import { api } from '@/api/Api'

export class PomodoroSceneApi {
  static async save(scene: PomodoroScene) {
    return await api.post('/pomodoro/scene', { data: scene })
  }

  /**
   * @param page      从1开始
   * @param pageSize
   */
  static async find(page: number = 1, pageSize: number = 100) {
    return await api.get(`/pomodoro/scene?page=${page}&pageSize=${pageSize}`)
  }

  static async delete(id: string) {
    return await api.delete();

  }
}
