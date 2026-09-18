import { nanoid } from 'nanoid'
import type { Todo, TodoPayload } from '@/data/Todo'
import type { UserData } from '@/data/UserData'
import { UserDataRepository } from '@/data/repository/UserDataRepository'
import { DateUtils } from '@/utils/DateUtils'

function toUserData(todo: Todo): UserData<TodoPayload> {
  const createTime = DateUtils.toISO(todo.createdDateTime || todo.createTime, new Date().toISOString())
  return {
    id: todo.id || nanoid(),
    userId: todo.userId ?? 0,
    dataType: 'todo',
    data: {
      title: todo.title,
      dueDateTime: todo.dueDateTime,
      reminderDateTime: todo.reminderDateTime,
      completedDateTime: todo.completedDateTime,
      importance: todo.importance,
      recurrence: todo.recurrence,
      startDateTime: todo.startDateTime,
      isReminderOn: todo.isReminderOn ?? false,
    },
    sortOrder: todo.order ?? 0,
    createTime: new Date(createTime),
    updateTime: new Date(DateUtils.toISO(todo.updateTime || todo.lastModifiedDateTime, createTime)),
    deleteTime: todo.deleteTime ? new Date(DateUtils.toISO(todo.deleteTime, createTime)) : null,
    needSync: todo.needSync,
    lastSyncedAt: todo.lastSyncedAt,
  }
}

function fromUserData(item: UserData<TodoPayload>): Todo {
  return {
    ...item.data,
    id: item.id,
    userId: item.userId,
    order: item.sortOrder ?? 0,
    createdDateTime: item.createTime.toISOString(),
    lastModifiedDateTime: item.updateTime.toISOString(),
    createTime: new Date(item.createTime),
    updateTime: new Date(item.updateTime),
    deleteTime: item.deleteTime ? new Date(item.deleteTime) : undefined,
    needSync: item.needSync,
    lastSyncedAt: item.lastSyncedAt,
  }
}

export class TodoRepository {
  static async findOne(options: { id: string | number, includeComplete?: boolean }): Promise<Todo | undefined> {
    const key = String(options.id)
    const item = await UserDataRepository.findOne<TodoPayload>({ id: key })
    if (!item || item.dataType !== 'todo') { return undefined }
    const todo = fromUserData(item)
    return !options.includeComplete && todo.completedDateTime ? undefined : todo
  }

  static async findAll(includeRemoved = false): Promise<Todo[]> {
    return (await UserDataRepository.findByDataType<TodoPayload>('todo', includeRemoved)).map(fromUserData)
  }

  static async findUncompleted(): Promise<Todo[]> {
    return (await this.findAll()).filter(todo => !todo.completedDateTime).sort((a, b) => a.order - b.order)
  }

  static async findCompleted(): Promise<Todo[]> {
    return (await this.findAll()).filter(todo => !!todo.completedDateTime)
      .sort((a, b) => b.completedDateTime!.localeCompare(a.completedDateTime!))
  }

  static async findReminderOn(): Promise<Todo[]> {
    return (await this.findUncompleted()).filter(todo => todo.isReminderOn)
      .sort((a, b) => (a.reminderDateTime ?? '').localeCompare(b.reminderDateTime ?? ''))
  }

  private static async resolve(todo: Todo | string): Promise<Todo> {
    const id = typeof todo === 'string' ? todo : String(todo.id)
    const item = await this.findOne({ id, includeComplete: true })
    if (!item) { throw new Error(`Todo with id ${id} not found`) }
    return item
  }

  static async remove(todo: Todo | string): Promise<Todo> {
    const item = await this.resolve(todo)
    await UserDataRepository.remove(item.id!)
    return item
  }

  static async softRemove(todo: Todo | string): Promise<Todo> {
    const item = await this.resolve(todo)
    const removed = await UserDataRepository.softRemove(item.id!)
    return fromUserData(removed as UserData<TodoPayload>)
  }

  static async save(todo: Todo, needSync = true, preserveTime = false): Promise<Todo> {
    return fromUserData(await UserDataRepository.save(toUserData(todo), needSync, preserveTime))
  }
}
