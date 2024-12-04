import { AndroidApi } from '@/api/android/AndroidApi'
import type { IPomodoroHistoryRepository } from '@/data/repository/interface/IPomodoroHistoryRepository'
import { AndroidPomodoroHistoryRepository } from '@/data/repository/android/AndroidPomodoroHistoryRepository'
import { WebPomodoroHistoryRepository } from '@/data/repository/web/WebPomodoroHistoryRepository'

let targetApi: IPomodoroHistoryRepository
if (AndroidApi.hasApi()) {
  targetApi = new AndroidPomodoroHistoryRepository()
}
else {
  targetApi = new WebPomodoroHistoryRepository()
}
export const PomodoroHistoryRepository = targetApi
