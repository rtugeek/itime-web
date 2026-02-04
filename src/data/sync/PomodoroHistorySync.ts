import consola from 'consola'
import { BaseSync } from '@/data/sync/BaseSync'
import type { PomodoroHistory } from '@/data/PomodoroHistory'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'
import { useSupabaseStore } from '@/stores/useSupabaseStore'
import type { BaseRemoteData } from '@/data/base/BaseData'

export interface RemotePomodoroHistory extends BaseRemoteData {
  user_id?: string
  scene_id?: number
  start_time?: string
  finish_time?: string
  duration?: number
}

class PomodoroHistorySyncImpl extends BaseSync<PomodoroHistory, RemotePomodoroHistory> {
  constructor() {
    super('pomodoro_history')
  }

  getLocalItems(): Promise<PomodoroHistory[]> {
    return PomodoroHistoryRepository.all()
  }

  async isLogin(): Promise<boolean> {
    const supabaseClient = useSupabaseStore().client
    const user = await supabaseClient.auth.getUser()
    return !user.error
  }

  async getRemoteItems(): Promise<RemotePomodoroHistory[]> {
    const supabaseClient = useSupabaseStore().client
    const res = await supabaseClient.from('pomodoro_history').select('*')
    if (res.error) {
      consola.error(res.error)
      return []
    }
    else {
      return res.data
    }
  }

  async pushToRemote(items: RemotePomodoroHistory[]): Promise<RemotePomodoroHistory[]> {
    if (items.length > 0) {
      consola.info('pushToRemote', items)
      const supabaseClient = useSupabaseStore().client
      const upsertItems = items.filter(it => it.uuid)
      const insertItems = items.filter(it => !it.uuid)

      const results: RemotePomodoroHistory[] = []

      if (insertItems.length > 0) {
        const insertResult = await supabaseClient.from('pomodoro_history').insert(insertItems).select()
        if (insertResult.data) {
          results.push(...insertResult.data)
        }
        if (insertResult.error) {
          consola.error('insert error', insertResult.error)
        }
      }

      if (upsertItems.length > 0) {
        const upsertResult = await supabaseClient.from('pomodoro_history').upsert(upsertItems).select()
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

  saveItem(item: PomodoroHistory, updateNeedSync: boolean = true): Promise<PomodoroHistory> {
    item.needSync = updateNeedSync
    return PomodoroHistoryRepository.save(item)
  }

  mapLocalToRemote(localItems: PomodoroHistory[]): RemotePomodoroHistory[] {
    return localItems.map((localItem) => {
      const remoteItem: RemotePomodoroHistory = {
        id: localItem.id,
        scene_id: localItem.sceneId,
        duration: localItem.duration,
        finish_time: localItem.finishTime,
        start_time: localItem.startTime,
        update_time: localItem.updateTime ? localItem.updateTime.toISOString() : new Date().toISOString(),
        create_time: localItem.createTime ? localItem.createTime.toISOString() : new Date().toISOString(),
      }
      if (localItem.uuid) {
        remoteItem.uuid = localItem.uuid
      }

      if (localItem.deleteTime) {
        remoteItem.delete_time = localItem.deleteTime.toISOString()
      }

      return remoteItem
    })
  }

  mapRemoteToLocal(remotes: RemotePomodoroHistory[]): PomodoroHistory[] {
    return remotes.map((item) => {
      const history: PomodoroHistory = {
        id: typeof item.id === 'string' ? Number.parseInt(item.id) : (item.id as number),
        sceneId: item.scene_id || 0,
        duration: item.duration || 0,
        finishTime: item.finish_time || '',
        startTime: item.start_time || '',
        uuid: item.uuid,
        tableId: item.uuid,
        createTime: item.create_time ? new Date(item.create_time) : undefined,
        updateTime: item.update_time ? new Date(item.update_time) : undefined,
        deleteTime: item.delete_time ? new Date(item.delete_time) : undefined,
      }
      return history
    })
  }
}

const PomodoroHistorySync = new PomodoroHistorySyncImpl()
export { PomodoroHistorySync }
