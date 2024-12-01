import { defineStore } from 'pinia'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'
import type { PomodoroHistory } from '@/data/PomodoroHistory'
import { useUserStore } from '@/stores/useUserStore'
import { PomodoroHistoryApi } from '@/api/PomodoroHistoryApi'

export const usePomodoroHistoryStore = defineStore('pomodoroHistoryStore', () => {
  const userStore = useUserStore()
  async function findBySceneId(sceneId: number): Promise<PomodoroHistory[]> {
    return await PomodoroHistoryRepository.findBySceneId(sceneId)
  }

  async function sync() {
    const historyList = await PomodoroHistoryRepository.all()
    for (const history of historyList) {
      if (!history.sceneId) {
        await PomodoroHistoryRepository.remove(history.id)
      }
      if (userStore.isLogin && !history.tableId) {
        await syncHistory(history)
      }
    }
  }

  async function syncHistory(history: PomodoroHistory) {
    const res = await PomodoroHistoryApi.save(history)
    history.tableId = res.tableId
    await PomodoroHistoryRepository.save(history)
  }

  async function save(history: PomodoroHistory) {
    await PomodoroHistoryApi.save(history)
    if (userStore.isLogin) {
      await syncHistory(history)
    }
  }

  sync()
  return {
    findBySceneId,
    save,
  }
})
