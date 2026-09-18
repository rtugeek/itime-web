import { ref } from 'vue'
import consola from 'consola'
import { WidgetApi, delay } from '@widget-js/core'
import { UserDataApi } from '@/api/UserDataApi'
import type { RemoteUserData, UserData } from '@/data/UserData'
import { UserDataRepository } from '@/data/repository/UserDataRepository'
import { useUserStore } from '@/stores/useUserStore'
import { AppConfig } from '@/common/AppConfig'
import { startSync } from '@/common/syncStatus'

export interface SyncOptions {
  delay?: number
}

const revision = ref(0)
const error = ref('')
const busy = ref(false)

function timestamp(value?: Date | string | null): number {
  return value ? new Date(value).getTime() || 0 : 0
}

function matchRemote(a: UserData, b: RemoteUserData): boolean {
  return a.id === b.id && Number(a.userId) === Number(b.userId)
}
function mapRemoteToLocal<T = unknown>(remotes: RemoteUserData<T>[]): UserData<T>[] {
  return remotes.map(remote => ({
    id: remote.id,
    userId: remote.userId,
    dataType: remote.dataType,
    data: remote.data,
    sortOrder: remote.sortOrder,
    deleteTime: remote.deleteTime ? new Date(remote.deleteTime) : null,
    createTime: new Date(remote.createTime),
    updateTime: new Date(remote.updateTime),
    needSync: false,
  }))
}

class UserDataSyncImpl {
  private timer?: ReturnType<typeof setTimeout>
  private running = false
  private requested = false
  private options?: SyncOptions
  private waiters: Array<() => void> = []

  readonly revision = revision
  readonly error = error
  readonly busy = busy

  log(...message: unknown[]) {
    consola.info('[UserData Sync]', ...message)
  }

  sync(options?: SyncOptions): Promise<void> {
    this.options = options
    this.requested = true
    const result = new Promise<void>(resolve => this.waiters.push(resolve))
    if (!this.running) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => void this.drain(), 1000)
    }
    return result
  }

  private async drain() {
    this.running = true
    try {
      while (this.requested) {
        this.requested = false
        try {
          await this.syncInternal(this.options)
        }
        catch (err) {
          consola.error(err)
        }
      }
    }
    finally {
      this.running = false
      this.waiters.splice(0).forEach(resolve => resolve())
    }
  }

  private async isLogin(): Promise<boolean> {
    return useUserStore().isLogin
  }

  private async getLocalItems<T = unknown>(): Promise<UserData<T>[]> {
    return UserDataRepository.findAll<T>(true)
  }

  private async getRemoteItems<T = unknown>(updatedSince?: number): Promise<RemoteUserData<T>[]> {
    const items: RemoteUserData<T>[] = []
    let page = 1
    let hasNext = true
    while (hasNext) {
      const result = await UserDataApi.list<T>({
        updatedSince,
        includeDeleted: true,
        page,
        size: 200,
      })
      items.push(...result.data)
      hasNext = result.hasNext
      page++
    }
    return items
  }

  private async pushOne<T = unknown>(local: UserData<T>, exists: boolean): Promise<RemoteUserData<T>> {
    if (local.deleteTime) {
      if (exists) {
        await UserDataApi.softDelete(local.id)
      }
      return {
        id: local.id,
        userId: local.userId,
        dataType: local.dataType,
        data: local.data,
        searchText: null,
        sortOrder: local.sortOrder,
        createTime: local.createTime.toISOString(),
        updateTime: local.updateTime.toISOString(),
        deleteTime: local.deleteTime?.toISOString(),
      }
    }
    if (exists) {
      return UserDataApi.update<T>(local.id, {
        id: local.id,
        dataType: local.dataType,
        data: local.data,
        searchText: '',
        sortOrder: local.sortOrder,
      })
    }
    return UserDataApi.create<T>({
      id: local.id,
      dataType: local.dataType,
      data: local.data,
      searchText: '',
      sortOrder: local.sortOrder,
    })
  }

  private async saveItem<T = unknown>(item: UserData<T>, needSync = false): Promise<UserData<T>> {
    return UserDataRepository.save(item, needSync, true)
  }

  private async syncInternal(options?: SyncOptions) {
    if (!await this.isLogin()) { return }
    const finishSync = startSync()
    try {
      await this.syncLoggedIn(options)
    }
    finally {
      finishSync()
    }
  }

  private async syncLoggedIn(options?: SyncOptions) {
    if (options?.delay) { await delay(options.delay) }

    const account = useUserStore().userId
    const token = localStorage.getItem(AppConfig.KEY_TOKEN)
    if (!account || !token) { return }

    const assertSession = () => {
      if (account !== useUserStore().userId || token !== localStorage.getItem(AppConfig.KEY_TOKEN)) {
        throw new Error('账户已变更，同步已停止')
      }
    }

    this.error.value = ''
    this.busy.value = true
    try {
      // Local edits and upload acknowledgements are not download cursors. Until
      // the API provides a stable cursor, fetch every page, including tombstones.
      const remotes = await this.getRemoteItems()
      assertSession()

      const locals = await this.getLocalItems()
      assertSession()

      const eligible = locals.filter(item => !item.userId || Number(item.userId) === account)
      const knownIds = new Set(eligible.map(item => item.id))
      const failures: string[] = []

      for (const snapshot of eligible) {
        assertSession()
        try {
          const current = (await this.getLocalItems()).find(item => item.id === snapshot.id)
          assertSession()
          if (!current || JSON.stringify(current) !== JSON.stringify(snapshot)) { continue }

          const remote = remotes.find(r => matchRemote(current, r))

          if (current.deleteTime) {
            if (current.needSync === false && current.lastSyncedAt) { continue }
            if (remote || (current.lastSyncedAt && Number(current.userId) === account)) {
              await UserDataApi.softDelete(current.id)
              assertSession()
            }
            const latest = (await this.getLocalItems()).find(item => item.id === current.id)
            assertSession()
            if (latest && JSON.stringify(latest) === JSON.stringify(current)) {
              await this.saveItem({ ...latest, userId: account, lastSyncedAt: new Date() }, false)
            }
            continue
          }

          const dirty = current.needSync !== false || !current.lastSyncedAt || Number(current.userId) !== account

          if (!dirty) {
            // 增量响应不包含未变化的记录，缺席不能作为删除依据。
            if (remote && timestamp(remote.updateTime) > timestamp(current.lastSyncedAt ?? current.updateTime)) {
              const downloaded = mapRemoteToLocal([remote])[0]
              await this.saveItem({
                ...downloaded,
                dataType: downloaded.dataType ?? current.dataType,
                id: current.id,
                userId: account,
                lastSyncedAt: new Date(remote.updateTime),
              }, false)
            }
            continue
          }

          if (remote && timestamp(remote.updateTime) > timestamp(current.updateTime)) {
            const downloaded = mapRemoteToLocal([remote])[0]
            await this.saveItem({
              ...downloaded,
              dataType: downloaded.dataType ?? current.dataType,
              id: current.id,
              userId: account,
              lastSyncedAt: new Date(remote.updateTime),
            }, false)
            continue
          }

          const upload = await this.saveItem({ ...current, userId: account }, true)
          const baselineSnapshot = JSON.stringify(upload)
          assertSession()

          const saved = await this.pushOne(upload, !!remote || (!!current.lastSyncedAt && Number(current.userId) === account))
          assertSession()
          if (!saved) { throw new Error('服务器未确认上传的记录') }

          const latest = (await this.getLocalItems()).find(item => item.id === current.id)
          assertSession()
          if (!latest) { continue }

          const unchanged = JSON.stringify(latest) === baselineSnapshot
          if (unchanged) {
            const merged: UserData = {
              ...latest,
              id: saved.id ?? latest.id,
              dataType: saved.dataType ?? latest.dataType,
              data: saved.data ?? latest.data,
              sortOrder: saved.sortOrder ?? latest.sortOrder,
              deleteTime: saved.deleteTime ? new Date(saved.deleteTime) : latest.deleteTime,
              createTime: saved.createTime ? new Date(saved.createTime) : latest.createTime,
              updateTime: saved.updateTime ? new Date(saved.updateTime) : latest.updateTime,
              userId: account,
              lastSyncedAt: saved.updateTime ? new Date(saved.updateTime) : latest.lastSyncedAt,
            }
            await this.saveItem(merged, false)
          }
          else {
            await this.saveItem({
              ...latest,
              id: saved.id ?? latest.id,
              userId: account,
              lastSyncedAt: new Date(saved.updateTime),
            }, true)
          }
        }
        catch (err) {
          try { assertSession() }
          catch { throw err }
          failures.push(err instanceof Error ? err.message : 'UserData 同步失败')
        }
      }

      for (const remote of remotes) {
        assertSession()
        if (knownIds.has(remote.id)) { continue }
        const existing = (await this.getLocalItems()).find(item => matchRemote(item, remote))
        assertSession()
        if (!existing) {
          const downloaded = mapRemoteToLocal([remote])[0]
          await this.saveItem({
            ...downloaded,
            userId: account,
            lastSyncedAt: new Date(remote.updateTime),
          }, false)
        }
      }

      if (failures.length) { throw new Error(`${failures.length} 条 UserData 同步失败：${failures[0]}`) }

      await WidgetApi.updateSyncInfo().catch(err => consola.error(err))
    }
    catch (err) {
      this.error.value = err instanceof Error ? err.message : 'UserData 同步失败，请重试'
      throw err
    }
    finally {
      this.busy.value = false
      this.revision.value++
    }
  }
}

export const UserDataSync = new UserDataSyncImpl()
