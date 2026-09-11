import { useBroadcastChannel } from '@vueuse/core'
import { getCurrentScope, onScopeDispose, watch } from 'vue'
import consola from 'consola'
import type { CountdownEvent } from '@/data/CountdownEvent'

export type CountdownBroadcastEvent = ({
  type: 'save'
  event: CountdownEvent
  time?: number
} | {
  type: 'delete'
  id: string
}) & { nonce?: number }

export interface UseCountdownBroadcastOptions {
  onChanged?: (event: CountdownBroadcastEvent) => void
}

const STORAGE_KEY = 'countdownEventStore_storage'

export function useCountdownBroadcast(options?: UseCountdownBroadcastOptions) {
  const broadcastChannel = useBroadcastChannel<CountdownBroadcastEvent, CountdownBroadcastEvent>({
    name: 'countdownEventStore',
  })

  const processedNonces = new Set<number>()

  const handleEvent = (payload: CountdownBroadcastEvent) => {
    if (!payload) { return }
    if (payload.nonce != null) {
      if (processedNonces.has(payload.nonce)) {
        consola.debug('Countdown broadcast event skipped (duplicate nonce):', payload.nonce)
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

    consola.info('Countdown broadcast event received:', payload)

    options?.onChanged?.(payload)
  }

  // VueUse creates the native channel on mount and exposes received messages as a ref.
  const stopWatching = watch(broadcastChannel.data, handleEvent, { flush: 'sync' })

  const onStorageChange = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY || !e.newValue) { return }
    try {
      const payload = JSON.parse(e.newValue) as CountdownBroadcastEvent
      handleEvent(payload)
    }
    catch (err) {
      consola.error('Failed to parse storage countdown event:', err)
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

  const postEvent = (event: CountdownBroadcastEvent) => {
    const wrapped: CountdownBroadcastEvent = { ...event, nonce: Date.now() + Math.random() }
    consola.info('Broadcasting countdown event:', wrapped)
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
