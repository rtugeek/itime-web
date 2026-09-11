import consola from 'consola'
import type { BaseRemoteData } from '@/data/base/BaseData'
import { CountdownEvent } from '@/data/CountdownEvent'
import { CountdownEventRepository } from '@/data/repository/CountdownEventRepository'
import { BaseSync } from '@/data/sync/BaseSync'
import { useSupabaseStore } from '@/stores/useSupabaseStore'

export interface RemoteCountdown extends BaseRemoteData {
  name: string
  note?: string
  date_time: string
  source_date_time: string
  recurrence?: string
  date_type: number
}

class CountdownSyncImpl extends BaseSync<CountdownEvent, RemoteCountdown> {
  constructor() {
    super('countdown')
  }

  getLocalItems(): Promise<CountdownEvent[]> {
    return CountdownEventRepository.all(true)
  }

  async isLogin(): Promise<boolean> {
    const supabaseClient = useSupabaseStore().client
    const user = await supabaseClient.auth.getUser()
    return !user.error
  }

  async getRemoteItems(): Promise<RemoteCountdown[]> {
    const supabaseClient = useSupabaseStore().client
    const res = await supabaseClient.from('countdown').select('*')
    if (res.error) {
      throw res.error
    }
    else {
      return res.data
    }
  }

  async pushToRemote(items: RemoteCountdown[]): Promise<RemoteCountdown[]> {
    if (items.length > 0) {
      const supabaseClient = useSupabaseStore().client
      const upsertItems = items.filter(it => it.uuid)
      const insertItems = items.filter(it => !it.uuid)
      consola.info('pushToRemote', { insertItems, upsertItems })
      const insertResult = insertItems.length ? await supabaseClient.from('countdown').insert(insertItems).select() : { data: [], error: null }
      const upsertResult = upsertItems.length ? await supabaseClient.from('countdown').upsert(upsertItems).select() : { data: [], error: null }

      if (insertResult.error) { consola.error(insertResult.error) }
      if (upsertResult.error) { consola.error(upsertResult.error) }

      const results: any[] = []
      if (insertResult.data) {
        results.push(...insertResult.data)
      }
      if (upsertResult.data) {
        results.push(...upsertResult.data)
      }
      return results
    }
    return []
  }

  saveItem(item: CountdownEvent, needSync: boolean = false): Promise<CountdownEvent> {
    return CountdownEventRepository.save(item, needSync, true)
  }

  mapLocalToRemote(localItems: CountdownEvent[]): RemoteCountdown[] {
    return localItems.map((localItem) => {
      const remoteItem: RemoteCountdown = {
        id: localItem.id,
        name: localItem.name,
        note: localItem.note,
        date_time: localItem.dateTime,
        source_date_time: localItem.sourceDateTime,
        recurrence: localItem.recurrence,
        date_type: localItem.dateType,
        update_time: localItem.updateTime?.toISOString() ?? new Date().toISOString(),
        create_time: localItem.createTime?.toISOString() ?? new Date().toISOString(),
        delete_time: localItem.deleteTime?.toISOString(),
      }
      if (localItem.uuid) {
        remoteItem.uuid = localItem.uuid
      }
      return remoteItem
    })
  }

  mapRemoteToLocal(remotes: RemoteCountdown[]): CountdownEvent[] {
    return remotes.map((item) => {
      const countdown = new CountdownEvent(item.name, new Date(item.source_date_time), item.date_type, item.recurrence, item.note)
      countdown.id = item.id
      countdown.uuid = item.uuid
      countdown.updateTime = item.update_time ? new Date(item.update_time) : new Date()
      countdown.createTime = item.create_time ? new Date(item.create_time) : new Date()
      countdown.deleteTime = item.delete_time ? new Date(item.delete_time) : undefined
      return countdown
    })
  }
}

const CountdownSync = new CountdownSyncImpl()
export { CountdownSync }
