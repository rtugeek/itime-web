import { api } from '@/api/Api'
import type { PomodoroHistory } from '@/data/PomodoroHistory'
import type { PageResult } from '@/api/ApiResult'

export class PomodoroHistoryApi {
  static async save(history: PomodoroHistory): Promise<PomodoroHistory> {
    return await api.post('/pomodoro/history', history)
  }

  /**
   * @param page      从1开始
   * @param pageSize
   */
  static async find(page: number = 1, pageSize: number = 100): Promise<PageResult<PomodoroHistory>> {
    const result = (await api.get(`/pomodoro/history?page=${page}&size=${pageSize}`)) as PageResult<PomodoroHistory>
    return result
  }

  static async delete(id: string | number) {
    return await api.delete(`/pomodoro/history/${id}`)
  }
}
