import Dexie, { type Table } from 'dexie'
import type { Birthday } from '@/data/Birthday'

export class BirthdayDatabase extends Dexie {
  birthdays!: Table<Birthday>

  constructor() {
    super('birthday-v1')

    this.version(1).stores({
      birthdays: '++id, year, month, dayOfMonth, dateType, tableId, userId, createTime, updateTime',
    })
  }
}

const db = new BirthdayDatabase()

export class BirthdayRepository {
  static async findOne(options: { id: string }): Promise<Birthday | undefined> {
    return db.birthdays.get(Number(options.id))
  }

  static async findAll(): Promise<Birthday[]> {
    return db.birthdays.toArray()
  }

  static async findByTableId(tableId: number): Promise<Birthday[]> {
    return db.birthdays.filter(birthday => birthday.tableId === tableId).toArray()
  }

  static async save(birthday: Birthday, needSync: boolean = false): Promise<Birthday> {
    const now = new Date().toISOString()
    birthday.needSync = needSync
    if (birthday.id) {
      // Update existing birthday
      const updatedBirthday = {
        ...birthday,
        updateTime: now,
      }
      await db.birthdays.put(updatedBirthday)
      return updatedBirthday
    }
    else {
      // Add new birthday
      const id = await db.birthdays.add({
        ...birthday,
        createTime: now,
        updateTime: now,
      } as Birthday) as number
      return {
        ...birthday,
        createTime: now,
        updateTime: now,
        id,
      }
    }
  }

  static async saveAll(birthdays: Birthday[], needSync: boolean = false): Promise<Birthday[]> {
    for (const birthday of birthdays) {
      await this.save(birthday, needSync)
    }
    return birthdays
  }

  static async remove(birthday: Birthday | string): Promise<Birthday> {
    const id = typeof birthday === 'string' ? Number(birthday) : birthday.id
    const birthdayToDelete = await db.birthdays.get(id)
    if (!birthdayToDelete) {
      throw new Error(`Birthday with id ${id} not found`)
    }
    await db.birthdays.delete(id)
    return birthdayToDelete
  }
}
