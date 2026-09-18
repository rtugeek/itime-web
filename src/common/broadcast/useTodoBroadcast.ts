import { useBroadcastChannel } from '@vueuse/core'
import { getCurrentScope, onScopeDispose, watch } from 'vue'
import consola from 'consola'
import { AppConfig } from '@/common/AppConfig'
import type { Todo } from '@/data/Todo'

export type TodoEvent = { type: 'sync', nonce?: number } | {
  type: 'insert' | 'update' | 'delete'
  todo: Todo
  nonce?: number
}

export interface UseTodoBroadcastOptions {
  onSynced?: () => void
  onUpdated?: (todo: Todo) => void
  onDeleted?: (todo: Todo) => void
  onInserted?: (todo: Todo) => void
}

const STORAGE_KEY = `${AppConfig.CHANNEL_TODO}_storage`

export function useTodoBroadcast(options?: UseTodoBroadcastOptions) {
  const broadcastChannel = useBroadcastChannel<TodoEvent, TodoEvent>({
    name: AppConfig.CHANNEL_TODO,
  })

  const processedNonces = new Set<number>()

  const handleEvent = (payload: TodoEvent) => {
    if (!payload) { return }
    if (payload.type !== 'sync' && payload.todo?.lastSyncedAt) {
      payload.todo.lastSyncedAt = new Date(payload.todo.lastSyncedAt)
    }
    if (payload.nonce != null) {
      if (processedNonces.has(payload.nonce)) {
        consola.debug('Todo broadcast event skipped (duplicate nonce):', payload.nonce)
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

    consola.info('Todo broadcast event received:', payload)

    switch (payload.type) {
      case 'sync':
        options?.onSynced?.()
        break
      case 'update':
        options?.onUpdated?.(payload.todo)
        break
      case 'delete':
        options?.onDeleted?.(payload.todo)
        break
      case 'insert':
        options?.onInserted?.(payload.todo)
        break
    }
  }

  // VueUse creates the native channel on mount and exposes received messages as a ref.
  const stopWatching = watch(broadcastChannel.data, handleEvent, { flush: 'sync' })

  const onStorageChange = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY || !e.newValue) { return }
    try {
      const payload = JSON.parse(e.newValue) as TodoEvent
      handleEvent(payload)
    }
    catch (err) {
      consola.error('Failed to parse storage todo event:', err)
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

  const postEvent = (event: TodoEvent) => {
    const wrapped: TodoEvent = { ...event, nonce: Date.now() + Math.random() }
    consola.info('Broadcasting todo event:', wrapped)
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
