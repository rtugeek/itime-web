import localforage from 'localforage'
import dayjs from 'dayjs'
import type { PomodoroHistory } from '@/data/PomodoroHistory'
import type { IPomodoroHistoryRepository } from '@/data/repository/interface/IPomodoroHistoryRepository'

const pomodoroHistoryRepository = localforage.createInstance({ name: 'pomodoro' })
export class WebPomodoroHistoryRepository implements IPomodoroHistoryRepository {
  get(id: string) {
    return pomodoroHistoryRepository.getItem<PomodoroHistory>(id)
  }

  save(value: PomodoroHistory): Promise<PomodoroHistory> {
    if (!value.id) {
      value.id = new Date().getTime() + Math.ceil(Math.random() * 1000)
    }
    const updateTime = dayjs().toISOString()
    if (!value.createTime) {
      value.createTime = dayjs().toISOString()
    }
    value.updateTime = updateTime
    return pomodoroHistoryRepository.setItem(value.id.toString(), value)
  }

  remove(key: number) {
    return pomodoroHistoryRepository.removeItem(key.toString())
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
      if (history) {
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
      if (history && history.sceneId === sceneId) {
        histories.push(history)
      }
    }
    return histories
  }
}
