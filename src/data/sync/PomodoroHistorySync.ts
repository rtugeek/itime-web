import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'
import { PomodoroHistoryApi } from '@/api/PomodoroHistoryApi'
import type { PomodoroHistory } from '@/data/PomodoroHistory'

export class PomodoroHistorySync {
  static async sync() {
    const historyList = await PomodoroHistoryRepository.all()
    await this.upload(historyList)
    await this.download()
  }

  static async upload(historyList: PomodoroHistory[]) {
    for (const history of historyList) {
      if (!history.tableId || history.needSync == undefined || history.needSync) {
        const res = await PomodoroHistoryApi.save(history)
        history.tableId = res.tableId
        history.needSync = false
        await PomodoroHistoryRepository.save(history)
      }
    }
  }

  static async download() {
    const serverHistory = await PomodoroHistoryApi.find()
    for (const history of serverHistory.data) {
      history.needSync = false
      await PomodoroHistoryRepository.save(history)
    }
  }
}
