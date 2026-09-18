import { nanoid } from 'nanoid'
import dayjs from 'dayjs'
import { CountdownEvent, type CountdownPayload } from '@/data/CountdownEvent'
import type { UserData } from '@/data/UserData'
import { UserDataRepository } from '@/data/repository/UserDataRepository'
import { AppConfig } from '@/common/AppConfig'
import { DateUtils } from '@/utils/DateUtils'

let initialization: Promise<void> | undefined

function toUserData(event: CountdownEvent): UserData<CountdownPayload> {
  const createTime = DateUtils.toISO(event.createTime, new Date().toISOString())
  return {
    id: event.id || nanoid(),
    userId: event.userId ?? 0,
    dataType: 'countdown',
    data: {
      name: event.name,
      note: event.note ?? '',
      image: event.image,
      dateTime: event.dateTime,
      sourceDateTime: event.sourceDateTime,
      dateType: event.dateType,
      recurrence: event.recurrence,
      periodType: event.periodType ?? 0,
      archiveTime: event.archiveTime ? DateUtils.toISO(event.archiveTime, createTime) : undefined,
    },
    sortOrder: event.sortOrder ?? 0,
    createTime: new Date(createTime),
    updateTime: new Date(DateUtils.toISO(event.updateTime, createTime)),
    deleteTime: event.deleteTime ? new Date(DateUtils.toISO(event.deleteTime, createTime)) : null,
    needSync: event.needSync,
    lastSyncedAt: event.lastSyncedAt,
  }
}

function fromUserData(item: UserData<CountdownPayload>): CountdownEvent {
  return CountdownEvent.fromObject({
    ...item.data,
    id: item.id,
    userId: item.userId,
    sortOrder: item.sortOrder ?? 0,
    archiveTime: item.data.archiveTime ? new Date(item.data.archiveTime) : undefined,
    createTime: new Date(item.createTime),
    updateTime: new Date(item.updateTime),
    deleteTime: item.deleteTime ? new Date(item.deleteTime) : undefined,
    needSync: item.needSync,
    lastSyncedAt: item.lastSyncedAt,
  })
}

export class CountdownEventRepository {
  static async get(key: string): Promise<CountdownEvent | null> {
    const item = await UserDataRepository.findOne<CountdownPayload>({ id: key })
    return item?.dataType === 'countdown' ? fromUserData(item) : null
  }

  static async save(value: CountdownEvent, needSync = true, preserveTime = false): Promise<CountdownEvent> {
    const saved = fromUserData(await UserDataRepository.save(toUserData(value), needSync, preserveTime))
    Object.assign(value, saved)
    return saved
  }

  static async remove(key: string): Promise<void> {
    const event = await this.get(key)
    if (event) { await UserDataRepository.remove(event.id!) }
  }

  static async softRemove(key: string): Promise<void> {
    const event = await this.get(key)
    if (event) { await UserDataRepository.softRemove(event.id!) }
  }

  static async saveAll(events: CountdownEvent[], needSync = true): Promise<CountdownEvent[]> {
    const result: CountdownEvent[] = []
    for (const event of events) {
      result.push(await this.save(event, needSync))
    }
    return result
  }

  static async clear(): Promise<void> {
    for (const event of await this.all(true)) {
      await UserDataRepository.remove(event.id!)
    }
  }

  static async all(includeRemoved = false): Promise<CountdownEvent[]> {
    return (await UserDataRepository.findByDataType<CountdownPayload>('countdown', includeRemoved)).map(fromUserData)
  }

  static async createDefaultCountdown(): Promise<void> {
    if (!initialization) {
      initialization = (async () => {
        if (localStorage.getItem(AppConfig.KEY_COUNTDOWN_INIT) == null && !(await this.all(true)).length) {
          const newYear = dayjs().add(1, 'year').startOf('year').toDate()
          await this.save(new CountdownEvent('新年', newYear))
        }
        localStorage.setItem(AppConfig.KEY_COUNTDOWN_INIT, 'true')
      })().catch((error) => {
        initialization = undefined
        throw error
      })
    }
    await initialization
  }
}
