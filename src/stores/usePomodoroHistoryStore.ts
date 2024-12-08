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

  async function deleteHistory(history: PomodoroHistory) {
    if (userStore.isLogin && history.tableId) {
      await PomodoroHistoryApi.delete(history.id)
      await PomodoroHistoryRepository.remove(history.id)
    }
    else {
      await PomodoroHistoryRepository.remove(history.id)
    }
  }

  async function syncHistory(history: PomodoroHistory) {
    const res = await PomodoroHistoryApi.save(history)
    history.tableId = res.tableId
    history.needSync = false
    await PomodoroHistoryRepository.save(history)
  }

  async function save(history: PomodoroHistory) {
    await PomodoroHistoryRepository.save(history)
    if (userStore.isLogin) {
      await syncHistory(history)
    }
  }

  return {
    findBySceneId,
    deleteHistory,
    save,
  }
})
