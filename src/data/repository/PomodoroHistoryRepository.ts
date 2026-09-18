import localforage from 'localforage'
import type { PomodoroHistory } from '@/data/PomodoroHistory'

const pomodoroHistoryStorage = localforage.createInstance({ name: 'pomodoro' })

class PomodoroHistoryRepositoryClass {
  async get(id: string) {
    return pomodoroHistoryStorage.getItem<PomodoroHistory>(id)
  }

  async save(value: PomodoroHistory, preserveTime: boolean = false): Promise<PomodoroHistory> {
    if (!value.id) {
      value.id = new Date().getTime() + Math.ceil(Math.random() * 1000)
    }
    if (!value.createTime) {
      value.createTime = new Date()
    }
    if (!preserveTime) { value.updateTime = new Date() }
    return pomodoroHistoryStorage.setItem(value.id.toString(), value)
  }

  async remove(key: number) {
    return pomodoroHistoryStorage.removeItem(key.toString())
  }

  async softRemove(history: PomodoroHistory) {
    history.deleteTime = new Date()
    history.needSync = true
    await this.save(history)
  }

  async removeBySceneId(sceneId: number | string) {
    const targetSceneId = String(sceneId)
    const keys = await pomodoroHistoryStorage.keys()
    for (const key of keys) {
      const history = await pomodoroHistoryStorage.getItem<PomodoroHistory>(key)
      if (history && String(history.sceneId) === targetSceneId) {
        await pomodoroHistoryStorage.removeItem(key)
      }
    }
  }

  async all(includeRemoved: boolean = false): Promise<PomodoroHistory[]> {
    const histories: PomodoroHistory[] = []
    const keys = await pomodoroHistoryStorage.keys()
    for (const key of keys) {
      const history = await pomodoroHistoryStorage.getItem<PomodoroHistory>(key)
      if (history && (includeRemoved || !history.deleteTime)) {
        histories.push(history)
      }
    }
    return histories
  }

  async clear() {
    return pomodoroHistoryStorage.clear()
  }

  async findBySceneId(sceneId: number | string, userId?: number): Promise<PomodoroHistory[]> {
    const targetSceneId = String(sceneId)
    const histories: PomodoroHistory[] = []
    const keys = await pomodoroHistoryStorage.keys()
    for (const key of keys) {
      const history = await pomodoroHistoryStorage.getItem<PomodoroHistory>(key)
      if (
        history
        && String(history.sceneId) === targetSceneId
        && !history.deleteTime
        && (!userId || !history.userId || Number(history.userId) === 0 || Number(history.userId) === userId)
      ) {
        histories.push(history)
      }
    }
    return histories
  }

  async claimUnownedToUser(newUserId: number): Promise<void> {
    const keys = await pomodoroHistoryStorage.keys()
    for (const oldKey of keys) {
      const history = await pomodoroHistoryStorage.getItem<PomodoroHistory>(oldKey)
      if (history && !history.userId) {
        history.userId = newUserId
        history.needSync = true
        history.syncVersion = undefined
        history.lastSyncedAt = undefined
        await pomodoroHistoryStorage.setItem(oldKey, history)
      }
    }
  }
}

export const PomodoroHistoryRepository = new PomodoroHistoryRepositoryClass()
