import consola from 'consola'
import { BaseSync } from '@/data/sync/BaseSync'
import { CountdownEvent } from '@/data/CountdownEvent'
import { CountdownEventRepository } from '@/data/repository/CountdownEventRepository'
import { getSupabaseClient } from '@/api/supabase'
import type { BaseRemoteData } from '@/data/base/BaseData'

export interface RemoteCountdown extends BaseRemoteData {
  name: string
  note?: string
  date_time: string
  source_date_time: string
  recurrence?: string
  date_type: number
}

export class CountdownSync extends BaseSync<CountdownEvent, RemoteCountdown> {
  constructor() {
    super('countdown')
  }

  getLocalItems(): Promise<CountdownEvent[]> {
    return CountdownEventRepository.all(true)
  }

  async getRemoteItems(): Promise<RemoteCountdown[]> {
    const supabaseClient = getSupabaseClient()
    const res = await supabaseClient.from('countdown').select('*')
    if (res.error) {
      consola.error('getRemoteItems', res.error)
      return []
    }
    else {
      consola.info('remoteItems', res.data)
      return res.data
    }
  }

  async pushChanges(items: RemoteCountdown[]): Promise<void> {
    const supabaseClient = getSupabaseClient()
    const upsertResult = await supabaseClient.from('countdown').upsert(items)
    if (upsertResult.error) {
      consola.info('pushChanges error', upsertResult.error)
    }
    else {
      consola.info(upsertResult.data)
    }
  }

  saveItem(item: CountdownEvent): Promise<CountdownEvent> {
    return CountdownEventRepository.save(item)
  }

  mapLocalToRemote(it: CountdownEvent): RemoteCountdown {
    const item: RemoteCountdown = {
      id: it.id,
      name: it.name,
      note: it.note,
      date_time: it.dateTime,
      source_date_time: it.sourceDateTime,
      recurrence: it.recurrence,
      date_type: it.dateType,
      update_time: it.updateTime?.toISOString() ?? new Date().toISOString(),
      create_time: it.createTime?.toISOString() ?? new Date().toISOString(),
      delete_time: it.deleteTime?.toISOString(),
    }
    if (item.uuid) {
      item.uuid = it.uuid
    }
    return item
  }

  mapRemoteToLocal(item: RemoteCountdown): CountdownEvent {
    const countdown = new CountdownEvent(item.name, new Date(item.source_date_time), item.date_type, item.recurrence, item.note)
    countdown.id = item.id
    countdown.uuid = item.uuid
    countdown.updateTime = item.update_time ? new Date(item.update_time) : new Date()
    countdown.createTime = item.create_time ? new Date(item.create_time) : new Date()
    countdown.deleteTime = item.delete_time ? new Date(item.delete_time) : undefined
    return countdown
  }
}
