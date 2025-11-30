import { WidgetApi, delay } from '@widget-js/core'
import consola from 'consola'
import type { BaseData, BaseRemoteData } from '@/data/base/BaseData'
import type { RemoteCountdown } from '@/data/sync/CountdownSync'

export interface SyncOptions {
  delay?: number
}
export abstract class BaseSync<T extends BaseData, R extends BaseRemoteData> {
  private name: string
  private isSync = false
  private debouncedSync: (options?: SyncOptions) => Promise<void>

  private customDebounce(func: (...args: any[]) => Promise<void>, wait: number): (...args: any[]) => Promise<void> {
    let timeout: NodeJS.Timeout | null = null
    return (...args: any[]): Promise<void> => {
      return new Promise((resolve) => {
        if (timeout) {
          clearTimeout(timeout)
        }
        timeout = setTimeout(async () => {
          await func(...args)
          resolve()
        }, wait)
      })
    }
  }

  constructor(name: string) {
    this.name = name
    this.debouncedSync = this.customDebounce(this.syncInternal.bind(this), 1000)
  }

  async sync(options?: SyncOptions) {
    return this.debouncedSync(options)
  }

  private async syncInternal(options?: SyncOptions): Promise<void> {
    if (this.isSync) {
      return
    }
    this.isSync = true
    try {
      if (!(await this.isLogin())) {
        return
      }
      if (options?.delay) {
        await delay(options.delay)
      }
      const localItems = await this.getLocalItems()

      const needSyncItems = localItems.filter((it) => {
        return it.needSync == undefined || it.needSync
      })

      const needUploadItems: T[] = []
      const needDownloadItems: R[] = []

      const remoteItems = await this.getRemoteItems()
      for (const remoteItem of remoteItems) {
        // 将remoteItems中有，但本地没有的item保存到本地
        const localItem = localItems.find(item => item.id === remoteItem.id)
        if (!localItem) {
          needDownloadItems.push(remoteItem)
        }
        else if (remoteItem.update_time) {
          const isNewer = new Date(remoteItem.update_time) > (localItem.updateTime || new Date(0))
          if (isNewer) {
            // 如果本地存在，则比较updateTime，如果比本地新，则覆盖本地
            needDownloadItems.push(remoteItem)
          }
        }
      }
      for (const t of this.mapRemoteToLocal(needDownloadItems)) {
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
          if (isNewer) {
            // 如果远程存在，则比较updateTime，如果比远程新，则覆盖远程
            needUploadItems.push(needSyncItem)
          }
        }
      }

      const remoteCountdowns = await this.pushToRemote(this.mapLocalToRemote(needUploadItems))
      for (const remoteItem of remoteCountdowns) {
        const find = localItems.find(it => it.id == remoteItem.id)
        if (find && !find.uuid) {
          find.uuid = remoteItem.uuid
          find.needSync = false
          consola.info('update uuid', find.id, find.uuid)
          await this.saveItem(find)
        }
      }
      WidgetApi.updateSyncInfo().catch()
    }
    catch (e) {
      consola.error(e)
    }
    finally {
      this.isSync = false
    }
  }

  abstract saveItem(item: T, updateNeedSync?: boolean): Promise<T>

  abstract pushToRemote(remoteItems: R[]): Promise<RemoteCountdown[]>

  abstract getLocalItems(): Promise<T[]>

  abstract getRemoteItems(): Promise<R[]>

  abstract mapRemoteToLocal(item: R[]): T[]
  abstract mapLocalToRemote(item: T[]): R[]
  abstract isLogin(): Promise<boolean>
}
