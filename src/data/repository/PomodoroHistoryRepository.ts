import type { IPomodoroHistoryRepository } from '@/data/repository/interface/IPomodoroHistoryRepository'
import { WebPomodoroHistoryRepository } from '@/data/repository/web/WebPomodoroHistoryRepository'

const targetApi: IPomodoroHistoryRepository = new WebPomodoroHistoryRepository()
export const PomodoroHistoryRepository = targetApi
