import { defineStore } from 'pinia'
import { PomodoroRepository } from '@/data/repository/PomodoroRepository'
import type { PomodoroHistory } from '@/data/PomodoroHistory'
import { useUserStore } from '@/stores/useUserStore'
import { PomodoroHistoryApi } from '@/api/PomodoroHistoryApi'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'

export const usePomodoroHistoryStore = defineStore('pomodoroHistoryStore', () => {
  const userStore = useUserStore()
  async function findBySceneId(sceneId: string): Promise<PomodoroHistory[]> {
    return await PomodoroRepository.findBySceneId(sceneId)
  }

  async function sync() {
    const historyList = await PomodoroRepository.all()
    for (const history of historyList) {
      if (!history.sceneId) {
        await PomodoroRepository.remove(history.id)
      }
      if (userStore.isLogin && !history.tableId) {
        await syncHistory(history)
      }
    }
  }

  async function syncHistory(history: PomodoroHistory) {
    const res = await PomodoroHistoryApi.save(history)
    history.tableId = res.tableId
    await PomodoroRepository.save(history)
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
