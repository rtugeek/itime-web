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
export const PomodoroSceneRepository = targetApi
