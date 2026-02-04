import consola from 'consola'
import dayjs from 'dayjs'
import { BaseSync } from '@/data/sync/BaseSync'
import type { PomodoroScene } from '@/data/PomodoroScene'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'
import { useSupabaseStore } from '@/stores/useSupabaseStore'
import type { BaseRemoteData } from '@/data/base/BaseData'

export interface RemotePomodoroScene extends BaseRemoteData {
  id?: string // uuid
  name?: string
  duration?: number
  icon?: string
  user_id?: string
}

class PomodoroSceneSyncImpl extends BaseSync<PomodoroScene, RemotePomodoroScene> {
  constructor() {
    super('pomodoro_scene')
  }

  getLocalItems(): Promise<PomodoroScene[]> {
    return PomodoroSceneRepository.all()
  }

  async isLogin(): Promise<boolean> {
    const supabaseClient = useSupabaseStore().client
    const user = await supabaseClient.auth.getUser()
    return !user.error
  }

  async getRemoteItems(): Promise<RemotePomodoroScene[]> {
    const supabaseClient = useSupabaseStore().client
    const res = await supabaseClient.from('pomodoro_scene').select('*')
    if (res.error) {
      consola.error(res.error)
      return []
    }
    else {
      return res.data
    }
  }

  async pushToRemote(items: RemotePomodoroScene[]): Promise<RemotePomodoroScene[]> {
    if (items.length > 0) {
      const supabaseClient = useSupabaseStore().client
      const upsertItems = items.filter(it => it.uuid)
      const insertItems = items.filter(it => !it.uuid)

      const results: RemotePomodoroScene[] = []

      if (insertItems.length > 0) {
        const insertResult = await supabaseClient.from('pomodoro_scene').insert(insertItems).select()
        if (insertResult.data) {
          results.push(...insertResult.data)
        }
        if (insertResult.error) {
          consola.error('insert error', insertResult.error)
        }
      }

      if (upsertItems.length > 0) {
        const upsertResult = await supabaseClient.from('pomodoro_scene').upsert(upsertItems).select()
        if (upsertResult.data) {
          results.push(...upsertResult.data)
        }
        if (upsertResult.error) {
          consola.error('upsert error', upsertResult.error)
        }
      }

      return results
    }
    return []
  }

  saveItem(item: PomodoroScene, updateNeedSync: boolean = true): Promise<PomodoroScene> {
    item.needSync = updateNeedSync
    return PomodoroSceneRepository.save(item)
  }

  mapLocalToRemote(localItems: PomodoroScene[]): RemotePomodoroScene[] {
    return localItems.map((localItem) => {
      if (typeof (localItem.createTime as unknown) == 'string') {
        localItem.createTime = dayjs(localItem.createTime).toDate()
      }
      const remoteItem: RemotePomodoroScene = {
        name: localItem.name,
        duration: localItem.duration,
        icon: localItem.icon,
        update_time: localItem.updateTime ? localItem.updateTime.toISOString() : new Date().toISOString(),
        create_time: localItem.createTime ? localItem.createTime.toISOString() : new Date().toISOString(),
      }
      if (localItem.uuid) {
        remoteItem.uuid = localItem.uuid
      }

      if (localItem.deleteTime) {
        remoteItem.delete_time = localItem.deleteTime.toISOString()
      }

      // Preserve local ID in a way if needed, or mapping relies on UUID
      // The schema says id is 'character varying null', maybe storing local ID?
      // But typically we sync via UUID.
      if (localItem.id) {
        remoteItem.id = localItem.id.toString()
      }

      return remoteItem
    })
  }

  mapRemoteToLocal(remotes: RemotePomodoroScene[]): PomodoroScene[] {
    return remotes.map((item) => {
      const scene: PomodoroScene = {
        name: item.name || '',
        duration: item.duration || 0,
        icon: item.icon || '',
        uuid: item.uuid,
        tableId: item.uuid,
        createTime: item.create_time ? new Date(item.create_time) : undefined,
        updateTime: item.update_time ? new Date(item.update_time) : undefined,
        deleteTime: item.delete_time ? new Date(item.delete_time) : undefined,
      }

      // Try to recover numeric ID if stored in remote 'id' field, otherwise generate one or keep undefined (repo will handle)
      if (item.id && !Number.isNaN(Number(item.id))) {
        scene.id = Number(item.id)
      }
      else {
        // If it's a new item from remote, we might need a local ID.
        // Repository save() usually handles ID generation if missing.
        // But for sync, we might want to keep consistent ID if possible.
        // For now let repo handle new ID generation if missing.
      }

      return scene
    })
  }
}

const PomodoroSceneSync = new PomodoroSceneSyncImpl()
export { PomodoroSceneSync }
