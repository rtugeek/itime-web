import localforage from 'localforage'
import dayjs from 'dayjs'
import consola from 'consola'
import type { PomodoroHistory } from '@/data/PomodoroHistory'
import type { IPomodoroHistoryRepository } from '@/data/repository/interface/IPomodoroHistoryRepository'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'

const pomodoroHistoryRepository = localforage.createInstance({ name: 'pomodoro' })
export class WebPomodoroHistoryRepository implements IPomodoroHistoryRepository {
  get(id: string) {
    return pomodoroHistoryRepository.getItem<PomodoroHistory>(id)
  }

  save(value: PomodoroHistory): Promise<PomodoroHistory> {
    if (!value.id) {
      value.id = new Date().getTime() + Math.ceil(Math.random() * 1000)
    }
    if (!value.createTime) {
      value.createTime = new Date()
    }
    value.updateTime = new Date()
    return pomodoroHistoryRepository.setItem(value.id.toString(), value)
  }

  remove(key: number) {
    return pomodoroHistoryRepository.removeItem(key.toString())
  }

  async softRemove(history: PomodoroHistory) {
    history.deleteTime = new Date()
    history.needSync = true
    await this.save(history)
  }

  async removeBySceneId(sceneId: number | string) {
    const keys = await pomodoroHistoryRepository.keys()
    for (const key of keys) {
      const history = await pomodoroHistoryRepository.getItem<PomodoroHistory>(key)
      if (history && history.sceneId === sceneId) {
        await pomodoroHistoryRepository.removeItem(key)
      }
    }
  }

  async all(): Promise<PomodoroHistory[]> {
    const histories: PomodoroHistory[] = []
    const keys = await pomodoroHistoryRepository.keys()
    for (const key of keys) {
      const history = await pomodoroHistoryRepository.getItem<PomodoroHistory>(key)
      if (history && !history.deleteTime) {
        histories.push(history)
      }
    }
    return histories
  }

  clear() {
    return pomodoroHistoryRepository.clear()
  }

  async findBySceneId(sceneId: number | string): Promise<PomodoroHistory[]> {
    const histories: PomodoroHistory[] = []
    const keys = await pomodoroHistoryRepository.keys()
    for (const key of keys) {
      const history = await pomodoroHistoryRepository.getItem<PomodoroHistory>(key)
      if (history && history.sceneId === sceneId && !history.deleteTime) {
        histories.push(history)
      }
    }
    return histories
  }
}

async function migrate() {
  const keys = await pomodoroHistoryRepository.keys()
  for (const key of keys) {
    const history = await pomodoroHistoryRepository.getItem<PomodoroHistory>(key)
    if (history) {
      if (history.startAt) {
        history.startTime = dayjs(history.startAt).toISOString()
        delete history.startAt
      }
      if (history.finishAt) {
        history.finishTime = dayjs(history.finishAt).toISOString()
        delete history.finishAt
      }
      if (history.updateAt) {
        delete history.updateAt
      }
      if (history.createAt) {
        delete history.createAt
      }
      await pomodoroHistoryRepository.setItem(key, history)
      if (!history.sceneId || !history.finishTime) {
        await PomodoroHistoryRepository.remove(history.id)
      }
    }
  }
}
migrate().catch(e => consola.error(e))
