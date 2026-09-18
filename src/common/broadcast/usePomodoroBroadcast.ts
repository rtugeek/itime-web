import { useBroadcastChannel } from '@vueuse/core'
import { getCurrentScope, onScopeDispose, watch } from 'vue'
import consola from 'consola'

export interface PomodoroEvent {
  type: 'save' | 'delete' | 'sync' | 'save-all'
  id?: string | number
  time?: number
  nonce?: number
}

export interface UsePomodoroBroadcastOptions {
  onChanged?: (event: PomodoroEvent) => void
}

const STORAGE_KEY = 'pomodoroSceneStore_storage'

export function usePomodoroBroadcast(options?: UsePomodoroBroadcastOptions) {
  const broadcastChannel = useBroadcastChannel<PomodoroEvent, PomodoroEvent>({
    name: 'pomodoroSceneStore',
  })

  const processedNonces = new Set<number>()

  const handleEvent = (payload: PomodoroEvent) => {
    if (!payload) { return }
    if (payload.nonce != null) {
      if (processedNonces.has(payload.nonce)) {
        consola.debug('Pomodoro broadcast event skipped (duplicate nonce):', payload.nonce)
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

    consola.info('Pomodoro broadcast event received:', payload)

    options?.onChanged?.(payload)
  }

  // VueUse creates the native channel on mount and exposes received messages as a ref.
  const stopWatching = watch(broadcastChannel.data, handleEvent, { flush: 'sync' })

  const onStorageChange = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY || !e.newValue) { return }
    try {
      const payload = JSON.parse(e.newValue) as PomodoroEvent
      handleEvent(payload)
    }
    catch (err) {
      consola.error('Failed to parse storage pomodoro event:', err)
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

  const postEvent = (event: PomodoroEvent) => {
    const wrapped: PomodoroEvent = { ...event, nonce: Date.now() + Math.random() }
    consola.info('Broadcasting pomodoro event:', wrapped)
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
