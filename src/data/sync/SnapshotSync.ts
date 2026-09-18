import { ref } from 'vue'
import type { BaseData, BaseRemoteData } from '@/data/base/BaseData'
import { BaseSync } from '@/data/sync/BaseSync'
import { AppConfig } from '@/common/AppConfig'
import { useUserStore } from '@/stores/useUserStore'

/** Full snapshots are required because the server physically deletes rows. */
export abstract class SnapshotSync<T extends BaseData, R extends BaseRemoteData> extends BaseSync<T, R> {
  readonly revision = ref(0)
  protected afterSync() {}
  readonly error = ref('')
  readonly busy = ref(false)
  async beforeSync(): Promise<void> {}
  async beforeUpload(item: T): Promise<void> { void item }
  async afterDelete(item: T): Promise<void> { void item }
  abstract deleteRemote(id: number): Promise<void>
  async isLogin() { return useUserStore().isLogin }
  private key(item: Pick<BaseData, 'id'>) { return String(item.id) }
  private version(item: R) { return JSON.stringify(item) }
  protected async syncLoggedIn() {
    const account = useUserStore().userId
    const token = localStorage.getItem(AppConfig.KEY_TOKEN)
    if (!account || !token) { return }
    const check = () => {
      if (account !== useUserStore().userId || token !== localStorage.getItem(AppConfig.KEY_TOKEN)) { throw new Error('账户已变更，同步已停止') }
    }
    const fresh = async (item: T) => (await this.getLocalItems()).find(value => this.key(value) === this.key(item))
    this.error.value = ''
    this.busy.value = true
    try {
      await this.beforeSync()
      check()
      const remotes = await this.getRemoteItems()
      const remoteById = new Map(remotes.map(item => [this.key(item), item]))
      check()
      const locals = await this.getLocalItems()
      check()
      const eligible = locals.filter(item => !item.userId || Number(item.userId) === account)
      const known = new Set(locals.map(item => this.key(item)))
      const failures: string[] = []
      for (const snapshot of eligible) {
        check()
        try {
          const current = await fresh(snapshot)
          check()
          if (!current || JSON.stringify(current) !== JSON.stringify(snapshot)) { continue }
          const remote = remoteById.get(this.key(current))
          if (current.deleteTime) {
            if (remote) { await this.deleteRemote(Number(current.id)) }
            check()
            const latest = await fresh(current)
            check()
            if (latest && JSON.stringify(latest) === JSON.stringify(current)) {
              await this.saveItem({ ...latest, userId: account }, false)
              await this.afterDelete({ ...latest, userId: account })
            }
            continue
          }
          const dirty = current.needSync !== false || !current.syncVersion || Number(current.userId) !== account
          if (!dirty) {
            if (!remote) {
              const removed = { ...current, deleteTime: new Date() }
              await this.saveItem(removed, false)
              await this.afterDelete(removed)
            }
            else if (current.syncVersion !== this.version(remote)) {
              await this.saveItem({ ...this.mapRemoteToLocal([remote])[0], id: current.id, userId: account, syncVersion: this.version(remote) }, false)
            }
            continue
          }
          if (!Number.isSafeInteger(Number(current.id)) || Number(current.id) <= 0) { throw new Error('无效的数据业务 ID') }
          await this.beforeUpload(current)
          check()
          // Claim ownership before posting, even if the response is lost.
          const upload = await this.saveItem({ ...current, userId: account }, true)
          const baseline = JSON.stringify(upload)
          check()
          const saved = (await this.pushToRemote(this.mapLocalToRemote([upload])))[0]
          check()
          if (!saved || this.key(saved) !== this.key(upload)) { throw new Error('服务器未确认上传的记录') }
          const latest = await fresh(upload)
          check()
          if (!latest) { continue }
          const unchanged = JSON.stringify(latest) === baseline
          const merged = unchanged ? { ...latest, ...this.mapRemoteToLocal([saved])[0], id: latest.id } : latest
          await this.saveItem({ ...merged, userId: account, syncVersion: this.version(saved) }, !unchanged)
        }
        catch (error) {
          check()
          failures.push(error instanceof Error ? error.message : '同步失败')
        }
      }
      for (const remote of remotes) {
        check()
        if (known.has(this.key(remote))) { continue }
        const existing = (await this.getLocalItems()).find(item => this.key(item) === this.key(remote))
        check()
        if (!existing) { await this.saveItem({ ...this.mapRemoteToLocal([remote])[0], userId: account, syncVersion: this.version(remote) }, false) }
      }
      if (failures.length) { throw new Error(`${failures.length} 条数据同步失败：${failures[0]}`) }
    }
    catch (error) {
      this.error.value = error instanceof Error ? error.message : '同步失败，请重试'
      throw error
    }
    finally {
      this.busy.value = false
      this.revision.value++
      this.afterSync()
    }
  }
}
