import { useBroadcastChannel } from '@vueuse/core'
import { getCurrentScope, onScopeDispose, watch } from 'vue'
import consola from 'consola'
import { AppConfig } from '@/common/AppConfig'
import type { Birthday } from '@/data/Birthday'

export interface BirthdayEvent {
  type: 'insert' | 'update' | 'delete'
  data: Birthday
  nonce?: number
}

export interface UseBirthdayBroadcastOptions {
  onUpdated?: (data: Birthday) => void
  onDeleted?: (data: Birthday) => void
  onInserted?: (data: Birthday) => void
}

const STORAGE_KEY = `${AppConfig.CHANNEL_BIRTHDAY}_storage`

export function useBirthdayBroadcast(options?: UseBirthdayBroadcastOptions) {
  const broadcastChannel = useBroadcastChannel<BirthdayEvent, BirthdayEvent>({
    name: AppConfig.CHANNEL_BIRTHDAY,
  })

  const processedNonces = new Set<number>()

  const handleEvent = (payload: BirthdayEvent) => {
    if (!payload) { return }
    if (payload.nonce != null) {
      if (processedNonces.has(payload.nonce)) {
        consola.debug('Birthday broadcast event skipped (duplicate nonce):', payload.nonce)
        return
      }
      processedNonces.add(payload.nonce)
      if (processedNonces.size > 100) {
        const firstKey = processedNonces.values().next().value
        if (firstKey != null) {
          processedNonces.delete(firstKey)
        }
      }
    }

    consola.info('Birthday broadcast event received:', payload)

    switch (payload.type) {
      case 'update':
        options?.onUpdated?.(payload.data)
        break
      case 'delete':
        options?.onDeleted?.(payload.data)
        break
      case 'insert':
        options?.onInserted?.(payload.data)
        break
    }
  }

  // VueUse creates the native channel on mount and exposes received messages as a ref.
  const stopWatching = watch(broadcastChannel.data, handleEvent, { flush: 'sync' })

  const onStorageChange = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY || !e.newValue) { return }
    try {
      const payload = JSON.parse(e.newValue) as BirthdayEvent
      handleEvent(payload)
    }
    catch (err) {
      consola.error('Failed to parse storage birthday event:', err)
    }
  }

  window.addEventListener('storage', onStorageChange)

  const cleanup = () => {
    stopWatching()
    window.removeEventListener('storage', onStorageChange)
  }

  if (getCurrentScope()) {
    onScopeDispose(cleanup)
  }

  const postEvent = (event: BirthdayEvent) => {
    const wrapped: BirthdayEvent = { ...event, nonce: Date.now() + Math.random() }
    consola.info('Broadcasting birthday event:', wrapped)
    try {
      broadcastChannel.post(wrapped)
    }
    catch (err) {
      consola.warn('BroadcastChannel post failed, fallback to storage:', err)
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapped))
    }
    catch (err) {
      consola.error('localStorage broadcast failed:', err)
    }
  }

  return {
    postEvent,
    close: () => {
      cleanup()
      broadcastChannel.close()
    },
  }
}
