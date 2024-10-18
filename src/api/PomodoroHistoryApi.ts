import { api } from '@/api/Api'
import type { PomodoroHistory } from '@/data/PomodoroHistory'

export class PomodoroHistoryApi {
  static async save(history: PomodoroHistory): Promise<PomodoroHistory> {
    return await api.post('/pomodoro/history', history)
  }

  /**
   * @param page      从1开始
   * @param pageSize
   */
  static async find(page: number = 1, pageSize: number = 100) {
    return await api.get(`/pomodoro/history?page=${page}&pageSize=${pageSize}`)
  }

  static async delete(id: string | number) {
    return await api.delete(`/pomodoro/history/${id}`)
  }
}
