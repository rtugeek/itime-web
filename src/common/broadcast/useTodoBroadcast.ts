import { useBroadcastChannel } from '@vueuse/core'
import { watch } from 'vue'
import consola from 'consola'
import { AppConfig } from '@/common/AppConfig'
import type { Todo } from '@/data/Todo'

export interface TodoEvent {
  type: 'insert' | 'update' | 'delete'
  todo: Todo
}

export interface UseTodoBroadcastOptions {
  onUpdated?: (todo: Todo) => void
  onDeleted?: (todo: Todo) => void
  onInserted?: (todo: Todo) => void
}

export function useTodoBroadcast(options?: UseTodoBroadcastOptions) {
  const broadcastChannel = useBroadcastChannel<TodoEvent, TodoEvent>({
    name: AppConfig.CHANNEL_TODO,
  })

  watch(broadcastChannel.data, () => {
    const payload = broadcastChannel.data.value
    if (!payload) { return }

    consola.info('Todo broadcast event received:', payload)

    switch (payload.type) {
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
  })

  const postEvent = (event: TodoEvent) => {
    consola.info('Broadcasting todo event:', event)
    broadcastChannel.post(event)
  }

  return {
    postEvent,
    close: broadcastChannel.close,
  }
}
