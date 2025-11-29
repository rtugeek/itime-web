import { WidgetApi, delay } from '@widget-js/core'
import consola from 'consola'
import type { BaseData, BaseRemoteData } from '@/data/base/BaseData'

export interface SyncOptions {
  delay?: number
  force?: boolean
}
export abstract class BaseSync<T extends BaseData, R extends BaseRemoteData> {
  private name: string

  constructor(name: string) {
    this.name = name
  }

  async sync(options?: SyncOptions) {
    if (options?.delay) {
      await delay(options.delay)
    }
    const localItems = await this.getLocalItems()
    const needSyncItems = localItems.filter((it) => {
      if (!it.updateTime) {
        return true
      }
      if (options?.force) {
        return true
      }
      return it.updateTime > this.latestSyncTime()
    })
    consola.info('needSyncItems:', localItems)

    const remoteItems = await this.getRemoteItems()
    const needUploadItems: T[] = []
    const needDownloadItems: R[] = []
    for (const remoteItem of remoteItems) {
      // 将remoteItems中有，但本地没有的item保存到本地
      const localItem = localItems.find(item => item.id === remoteItem.id)
      if (!localItem) {
        needDownloadItems.push(remoteItem)
      }
      else if (remoteItem.update_time) {
        const isNewer = new Date(remoteItem.update_time) > (localItem.updateTime || new Date(0))
        consola.info(isNewer, new Date(remoteItem.update_time), localItem.updateTime)
        if (isNewer) {
          // 如果本地存在，则比较updateTime，如果比本地新，则覆盖本地
          needDownloadItems.push(remoteItem)
        }
      }
    }

    consola.info('need download items:', needDownloadItems)

    for (const t of needDownloadItems.map(this.mapRemoteToLocal)) {
      consola.info('save items', t)
      await this.saveItem(t)
    }

    for (const needSyncItem of needSyncItems) {
      // 将localItems中有，但远程没有的item上传到远程
      const remoteItem = remoteItems.find(item => item.id === needSyncItem.id)
      if (!remoteItem) {
        needUploadItems.push(needSyncItem)
      }
      else if (needSyncItem.updateTime) {
        const isNewer = needSyncItem.updateTime > new Date(remoteItem.update_time)
        consola.info(isNewer, needSyncItem.updateTime, remoteItem.update_time)
        if (isNewer) {
          // 如果远程存在，则比较updateTime，如果比远程新，则覆盖远程
          needUploadItems.push(needSyncItem)
        }
      }
    }
    consola.info('need upload items:', needUploadItems)
    await this.pushChanges(needUploadItems.map(this.mapLocalToRemote))
    this.updateLatestSyncTime()
    WidgetApi.updateSyncInfo().catch()
  }

  latestSyncTime(): Date {
    const str = localStorage.getItem(`sync-${this.name}-last-sync-time`)
    if (str) {
      return new Date(str)
    }
    return new Date(0)
  }

  updateLatestSyncTime() {
    const now = new Date()
    localStorage.setItem(`sync-${this.name}-last-sync-time`, now.toISOString())
    WidgetApi.updateSyncInfo().catch()
  }

  abstract saveItem(item: T): Promise<T>

  abstract pushChanges(remoteItems: R[]): Promise<void>

  abstract getLocalItems(): Promise<T[]>

  abstract getRemoteItems(): Promise<R[]>

  abstract mapRemoteToLocal(item: R): T
  abstract mapLocalToRemote(item: T): R
}
