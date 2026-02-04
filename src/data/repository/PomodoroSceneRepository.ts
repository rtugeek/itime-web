import { WebPomodoroSceneRepository } from '@/data/repository/web/WebPomodoroSceneRepository'
import type { IPomodoroSceneRepository } from '@/data/repository/interface/IPomodoroSceneRepository'

const targetApi: IPomodoroSceneRepository = new WebPomodoroSceneRepository()
export const PomodoroSceneRepository = targetApi
