import Dexie, { type Table } from 'dexie'
import { nanoid } from 'nanoid'
import type { RemoteUserData, UserData, UserDataOptions, UserDataType } from '@/data/UserData'

export class UserDataDatabase extends Dexie {
  userDatas!: Table<UserData>

  constructor() {
    // A new database is required when changing the primary key; no legacy data migration.
    super('userdata-v2')

    this.version(1).stores({
      userDatas: '&id, userId, dataType, [userId+dataType], sortOrder, createTime, updateTime, needSync',
    })
    this.version(2).stores({
      userDatas: '&id, userId, dataType, [userId+dataType], sortOrder, createTime, updateTime, needSync',
    }).upgrade(async (transaction) => {
      await transaction.table('userDatas').toCollection().modify((item) => {
        item.createTime = new Date(item.createTime)
        item.updateTime = new Date(item.updateTime)
        item.deleteTime = item.deleteTime ? new Date(item.deleteTime) : null
      })
    })
  }
}

const db = new UserDataDatabase()

function ensureId(userData: UserData): string {
  if (userData.id) { return userData.id }
  return nanoid()
}

export class UserDataRepository {
  static async findOne<T = unknown>(options: { id: string }): Promise<UserData<T> | undefined> {
    if (options.id) {
      return db.userDatas.get(options.id) as Promise<UserData<T> | undefined>
    }

    return undefined
  }

  static async findAll<T = unknown>(includeRemoved = false): Promise<UserData<T>[]> {
    const items = await db.userDatas.toArray()
    return items.filter(item => includeRemoved || !item.deleteTime) as UserData<T>[]
  }

  static async findByDataType<T = unknown>(dataType: UserDataType, includeRemoved = false): Promise<UserData<T>[]> {
    const items = await db.userDatas
      .where('dataType')
      .equals(dataType)
      .sortBy('sortOrder')
    const filteredItems = items.filter(item => includeRemoved || !item.deleteTime) as UserData<T>[]
    return filteredItems
  }

  static async findByUserId<T = unknown>(userId: number, includeRemoved = false): Promise<UserData<T>[]> {
    const items = await db.userDatas
      .where('userId')
      .equals(userId)
      .sortBy('sortOrder')
    const filteredItems = items.filter(item => includeRemoved || !item.deleteTime) as UserData<T>[]
    return filteredItems
  }

  static async findByUserIdAndDataType<T = unknown>(
    userId: number,
    dataType: UserDataType,
    includeRemoved = false,
  ): Promise<UserData<T>[]> {
    const items = await db.userDatas
      .where('[userId+dataType]')
      .equals([userId, dataType])
      .sortBy('sortOrder')
    return items.filter(item => includeRemoved || !item.deleteTime) as UserData<T>[]
  }

  static async findNeedSync<T = unknown>(): Promise<UserData<T>[]> {
    return db.userDatas
      .filter(item => item.needSync !== false && !item.deleteTime)
      .toArray() as Promise<UserData<T>[]>
  }

  static async create<T = unknown>(
    options: UserDataOptions<T>,
    needSync = false,
  ): Promise<UserData<T>> {
    const now = new Date()
    const data: UserData<T> = {
      id: options.id,
      userId: options.userId,
      dataType: options.dataType,
      data: options.data,
      sortOrder: options.sortOrder ?? 0,
      deleteTime: options.deleteTime ?? null,
      createTime: options.createTime ?? now,
      updateTime: options.updateTime ?? now,
      needSync,
    }
    return this.save(data, needSync, true)
  }

  static async save<T = unknown>(
    userData: UserData<T>,
    needSync = false,
    preserveTime = false,
  ): Promise<UserData<T>> {
    const now = new Date()
    const id = ensureId(userData)
    const existing = await db.userDatas.get(id) as UserData<T> | undefined
    const saved: UserData<T> = {
      ...userData,
      id,
      dataType: userData.dataType ?? existing?.dataType ?? userData.dataType,
      createTime: new Date(userData.createTime || existing?.createTime || now),
      updateTime: preserveTime ? new Date(userData.updateTime) : now,
      deleteTime: userData.deleteTime ? new Date(userData.deleteTime) : null,
      needSync,
    }
    await db.userDatas.put(saved)
    return saved
  }

  static async saveAll<T = unknown>(
    userDataList: UserData<T>[],
    needSync = false,
  ): Promise<UserData<T>[]> {
    for (const userData of userDataList) {
      await this.save(userData, needSync)
    }
    return userDataList
  }

  static async softRemove(userData: UserData | string): Promise<UserData> {
    const id = typeof userData === 'object' ? userData.id : userData
    const current = await db.userDatas.get(id)
    if (!current) {
      throw new Error('UserData 不存在')
    }
    return this.save({ ...current, deleteTime: new Date() }, true)
  }

  static async remove(userData: UserData | string): Promise<UserData> {
    const id = typeof userData === 'object' ? userData.id : userData
    const dataToDelete = await db.userDatas.get(id)
    if (!dataToDelete) {
      throw new Error(`UserData with id ${id} not found`)
    }
    await db.userDatas.delete(id)
    return dataToDelete
  }

  static async claimUnownedToUser(newUserId: number): Promise<void> {
    const all = await db.userDatas.toArray()
    for (const item of all) {
      if (item.userId) { continue }
      const updated: UserData = {
        ...item,
        userId: newUserId,
        lastSyncedAt: undefined,
        needSync: true,
      }
      await db.userDatas.put(updated)
    }
  }

  static async clear(): Promise<void> {
    return db.userDatas.clear()
  }

  static async count(): Promise<number> {
    return db.userDatas.count()
  }

  static mapRemoteToLocal<T = unknown>(remotes: RemoteUserData<T>[]): UserData<T>[] {
    return remotes.map((remote) => {
      return {
        id: remote.id,
        userId: remote.userId,
        dataType: remote.dataType,
        data: remote.data,
        sortOrder: remote.sortOrder,
        deleteTime: remote.deleteTime ? new Date(remote.deleteTime) : null,
        createTime: new Date(remote.createTime),
        updateTime: new Date(remote.updateTime),
        needSync: false,
      }
    })
  }

  static mapLocalToRemote<T = unknown>(locals: UserData<T>[]): RemoteUserData<T>[] {
    return locals.map(local => ({
      id: local.id,
      userId: local.userId,
      dataType: local.dataType,
      data: local.data,
      searchText: '',
      sortOrder: local.sortOrder,
      createTime: local.createTime.toISOString(),
      updateTime: local.updateTime.toISOString(),
      deleteTime: local.deleteTime?.toISOString(),
    }))
  }
}
