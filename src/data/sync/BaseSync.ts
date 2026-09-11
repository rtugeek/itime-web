import { WidgetApi, delay } from '@widget-js/core'
import consola from 'consola'
import { startSync } from '@/common/syncStatus'
import type { BaseData, BaseRemoteData } from '@/data/base/BaseData'

export interface SyncOptions {
  delay?: number
}

export abstract class BaseSync<T extends BaseData, R extends BaseRemoteData> {
  private timer?: ReturnType<typeof setTimeout>
  private running = false
  private requested = false
  private options?: SyncOptions
  private waiters: Array<() => void> = []

  constructor(private name: string) {}

  log(...message: any[]) {
    consola.info(`[${this.name} Sync]`, ...message)
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
        catch (error) {
          consola.error(error)
        }
      }
    }
    finally {
      this.running = false
      this.waiters.splice(0).forEach(resolve => resolve())
    }
  }

  private matches(a: BaseData, b: BaseData): boolean {
    if (a.uuid && b.uuid) { return a.uuid === b.uuid }
    return a.id != null && b.id != null && String(a.id) === String(b.id)
  }

  private timestamp(value?: Date | string): number {
    return value ? new Date(value).getTime() || 0 : 0
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

    // Fetch remote first so local edits made during the request enter this snapshot.
    const remotes = await this.getRemoteItems()
    const locals = await this.getLocalItems()
    const uploads: T[] = []
    for (const remote of remotes) {
      const local = locals.find(item => this.matches(item, remote))
      if (!local || this.timestamp(remote.update_time) > this.timestamp(local.updateTime)) {
        const current = (await this.getLocalItems()).find(item => this.matches(item, remote))
        if (JSON.stringify(current) !== JSON.stringify(local)) { continue }
        const downloaded = this.mapRemoteToLocal([remote])[0]
        if (local) { downloaded.id = local.id }
        await this.saveItem(downloaded, false)
      }
    }
    for (const local of locals) {
      if (local.needSync === false) { continue }
      const remote = remotes.find(item => this.matches(local, item))
      if (!remote || this.timestamp(local.updateTime) >= this.timestamp(remote.update_time)) {
        // Recover identity after an insert succeeded but its response was lost.
        uploads.push({ ...local, uuid: remote?.uuid ?? local.uuid })
      }
    }
    const pushed = uploads.length ? await this.pushToRemote(this.mapLocalToRemote(uploads)) : []
    for (const remote of pushed) {
      const uploaded = uploads.find(item => this.matches(item, remote))
      if (!uploaded) { continue }
      const original = locals.find(item => this.matches(item, uploaded))
      const current = (await this.getLocalItems()).find(item => this.matches(item, uploaded))
      if (!current) { continue }
      const unchanged = JSON.stringify(current) === JSON.stringify(original)
      await this.saveItem({ ...current, uuid: remote.uuid ?? current.uuid }, !unchanged)
    }
    await WidgetApi.updateSyncInfo().catch(error => consola.error(error))
  }

  // Sync persistence must preserve modification times, even when keeping a dirty item.
  abstract saveItem(item: T, needSync?: boolean): Promise<T>
  abstract pushToRemote(remoteItems: R[]): Promise<R[]>
  abstract getLocalItems(): Promise<T[]>
  abstract getRemoteItems(): Promise<R[]>
  abstract mapRemoteToLocal(item: R[]): T[]
  abstract mapLocalToRemote(item: T[]): R[]
  abstract isLogin(): Promise<boolean>
}
