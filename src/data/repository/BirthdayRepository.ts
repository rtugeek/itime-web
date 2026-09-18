import { nanoid } from 'nanoid'
import type { UserData } from '@/data/UserData'
import type { BirthdayPayload, IBirthday } from '@/data/Birthday'
import { UserDataRepository } from '@/data/repository/UserDataRepository'

function toData<T extends IBirthday>(birthday: T): BirthdayPayload {
  return {
    name: birthday.name,
    year: birthday.year,
    month: birthday.month,
    dayOfMonth: birthday.dayOfMonth,
    dateType: birthday.dateType,
    introduction: birthday.introduction ?? '',
  }
}

function fromUserData(item: UserData<BirthdayPayload>): IBirthday {
  return {
    dataType: 'birthday',
    id: item.id,
    userId: item.userId,
    name: item.data.name,
    year: item.data.year,
    month: item.data.month,
    dayOfMonth: item.data.dayOfMonth,
    dateType: item.data.dateType,
    introduction: item.data.introduction ?? '',
    deleteTime: item.deleteTime ? new Date(item.deleteTime) : null,
    createTime: new Date(item.createTime),
    updateTime: new Date(item.updateTime),
    sortOrder: item.sortOrder ?? 0,
    needSync: item.needSync,
    lastSyncedAt: item.lastSyncedAt,
  }
}

function toUserData(birthday: IBirthday): UserData<BirthdayPayload> {
  return {
    id: birthday.id || nanoid(),
    userId: birthday.userId ?? 0,
    dataType: 'birthday',
    data: toData(birthday),
    sortOrder: birthday.sortOrder ?? 0,
    deleteTime: birthday.deleteTime ?? null,
    createTime: birthday.createTime,
    updateTime: birthday.updateTime,
    needSync: birthday.needSync,
    lastSyncedAt: birthday.lastSyncedAt,
  }
}

export class BirthdayRepository {
  static async findOne(options: { id: string }): Promise<IBirthday | undefined> {
    const item = await UserDataRepository.findOne<BirthdayPayload>({ id: options.id })
    return item?.dataType === 'birthday' ? fromUserData(item) : undefined
  }

  static async findAll(includeRemoved = false): Promise<IBirthday[]> {
    const items = await UserDataRepository.findByDataType<BirthdayPayload>('birthday', includeRemoved)
    return items.map(fromUserData)
  }

  static async save(birthday: IBirthday, needSync = false, preserveTime = false): Promise<IBirthday> {
    const user = toUserData(birthday)
    const saved = await UserDataRepository.save<BirthdayPayload>(user, needSync, preserveTime)
    return fromUserData(saved)
  }

  static async softRemove(birthday: IBirthday | string): Promise<IBirthday> {
    const id = typeof birthday === 'string' ? birthday : String(birthday.id)
    const removed = await UserDataRepository.softRemove(id)
    return fromUserData(removed as UserData<BirthdayPayload>)
  }

  static async saveAll(birthdays: IBirthday[], needSync: boolean = false): Promise<IBirthday[]> {
    const result: IBirthday[] = []
    for (const birthday of birthdays) {
      result.push(await this.save(birthday, needSync))
    }
    return result
  }

  static async remove(birthday: IBirthday | string): Promise<IBirthday> {
    const id = typeof birthday === 'string' ? birthday : String(birthday.id)
    const removed = await UserDataRepository.remove(id)
    return fromUserData(removed as UserData<BirthdayPayload>)
  }
}
