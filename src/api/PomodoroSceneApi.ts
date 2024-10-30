import type { PomodoroScene } from '@/data/PomodoroScene'
import { api } from '@/api/Api'
import type { PageResult } from '@/api/ApiResult'

export class PomodoroSceneApi {
  static async save(scene: PomodoroScene): Promise<PomodoroScene> {
    return await api.post('/pomodoro/scene', scene)
  }

  /**
   * @param page      从1开始
   * @param pageSize
   */
  static async find(page: number = 1, pageSize: number = 100): Promise<PageResult<PomodoroScene>> {
    return await api.get(`/pomodoro/scene?page=${page}&pageSize=${pageSize}`)
  }

  static async delete(id: string) {
    return await api.delete(`/pomodoro/scene/${id}`)
  }
}
