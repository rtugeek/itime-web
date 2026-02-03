import consola from 'consola'
import { BaseSync } from '@/data/sync/BaseSync'
import { Todo, type TodoImportance } from '@/data/Todo'
import { TodoRepository } from '@/data/repository/TodoRepository'
import { useSupabaseStore } from '@/stores/useSupabaseStore'
import type { BaseRemoteData } from '@/data/base/BaseData'

export interface RemoteTodo extends BaseRemoteData {
  title: string
  due_date_time?: string
  reminder_date_time?: string
  importance?: TodoImportance
  completed_date_time?: string
  is_reminder_on: boolean
  order?: number
}

class TodoSyncImpl extends BaseSync<Todo, RemoteTodo> {
  constructor() {
    super('todo')
  }

  getLocalItems(): Promise<Todo[]> {
    return TodoRepository.findAll()
  }

  async isLogin(): Promise<boolean> {
    const supabaseClient = useSupabaseStore().client
    const user = await supabaseClient.auth.getUser()
    return !user.error
  }

  async getRemoteItems(): Promise<RemoteTodo[]> {
    const supabaseClient = useSupabaseStore().client
    const res = await supabaseClient.from('todo').select('*')
    if (res.error) {
      return []
    }
    else {
      return res.data
    }
  }

  async pushToRemote(items: RemoteTodo[]): Promise<RemoteTodo[]> {
    if (items.length > 0) {
      consola.info('pushToRemote', items)
      const supabaseClient = useSupabaseStore().client
      const upsertItems = items.filter(it => it.uuid)
      const insertItems = items.filter(it => !it.uuid)
      const insertResult = await supabaseClient.from('todo').insert(insertItems).select()
      const upsertResult = await supabaseClient.from('todo').upsert(upsertItems).select()

      const results: RemoteTodo[] = []
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

  saveItem(item: Todo): Promise<Todo> {
    return TodoRepository.save(item, item.needSync)
  }

  mapLocalToRemote(localItems: Todo[]): RemoteTodo[] {
    return localItems.map((localItem) => {
      const remoteItem: RemoteTodo = {
        id: localItem.id,
        title: localItem.title,
        due_date_time: localItem.dueDateTime,
        reminder_date_time: localItem.reminderDateTime,
        importance: localItem.importance,
        completed_date_time: localItem.completedDateTime,
        is_reminder_on: localItem.isReminderOn,
        update_time: localItem?.updateTime ? localItem?.updateTime.toISOString() : localItem.lastModifiedDateTime,
        create_time: localItem.createdDateTime,
        order: localItem.order,
        delete_time: localItem.deleteTime?.toISOString(),
      }
      if (localItem.uuid) {
        remoteItem.uuid = localItem.uuid
      }
      return remoteItem
    })
  }

  mapRemoteToLocal(remotes: RemoteTodo[]): Todo[] {
    return remotes.map((item) => {
      const todo = new Todo({
        title: item.title,
        importance: item.importance,
        isReminderOn: item.is_reminder_on,
      })
      todo.id = item.id
      todo.uuid = item.uuid
      todo.order = item.order ?? 0
      todo.dueDateTime = item.due_date_time
      todo.reminderDateTime = item.reminder_date_time
      todo.completedDateTime = item.completed_date_time
      todo.lastModifiedDateTime = item.update_time
      todo.updateTime = new Date(item.update_time)
      todo.createdDateTime = item.create_time
      return todo
    })
  }
}

const TodoSync = new TodoSyncImpl()
export { TodoSync }
