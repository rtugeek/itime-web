import localforage from 'localforage'
import { nanoid } from 'nanoid'
import dayjs from 'dayjs'
import { CountdownEvent } from '@/data/CountdownEvent'
import { AppConfig } from '@/common/AppConfig'

const countdownEventRepository = localforage.createInstance({ name: 'countdown-event' })
export class CountdownEventRepository {
  static async get(key: string): Promise<CountdownEvent | null> {
    return countdownEventRepository.getItem<CountdownEvent>(key)
  }

  static async save(value: CountdownEvent) {
    if (!value.id) {
      value.id = nanoid()
    }
    if (!value.createTime) {
      value.createTime = new Date()
    }
    value.updateTime = new Date()
    return countdownEventRepository.setItem(value.id, value)
  }

  static async remove(key: string) {
    return countdownEventRepository.removeItem(key)
  }

  static async clear() {
    return countdownEventRepository.clear()
  }

  static async all(): Promise<CountdownEvent[]> {
    const events: CountdownEvent[] = []
    const keys = await countdownEventRepository.keys()
    for (const key of keys) {
      const event = await countdownEventRepository.getItem<CountdownEvent>(key)
      if (event) {
        events.push(event)
      }
    }
    return events
  }

  static async createDefaultCountdown() {
    const init = localStorage.getItem(AppConfig.KEY_COUNTDOWN_INIT)
    if (init == null) {
      const newYear = dayjs().add(1, 'year').startOf('year').toDate()
      const countdown = new CountdownEvent('新年', newYear, -3)
      await this.save(countdown)
    }
    localStorage.setItem(AppConfig.KEY_COUNTDOWN_INIT, 'true')
  }
}
