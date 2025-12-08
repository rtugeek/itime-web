import Dexie, { type Table } from 'dexie'
import type { Todo } from '@/data/Todo'

export class TodoDatabase extends Dexie {
  todos!: Table<Todo>

  constructor() {
    super('todo-v1')

    this.version(1).stores({
      todos: '++id, title, createdDateTime, uuid, needSync,updateTime, completedDateTime, isReminderOn, dueDateTime, importance, order',
    })
  }
}

const db = new TodoDatabase()
export class TodoRepository {
  static async findOne(options: { id: string | number, includeComplete?: boolean }): Promise<Todo | undefined> {
    const todo = await db.todos.get(Number(options.id))
    if (!todo) { return undefined }

    if (!options.includeComplete && todo.completedDateTime) {
      return undefined
    }

    return todo
  }

  static async findUncompleted(): Promise<Todo[]> {
    return db.todos
      .filter(todo => !todo.completedDateTime)
      .filter(todo => !todo.deleteTime)
      .sortBy('order')
  }

  static async findCompleted(): Promise<Todo[]> {
    return db.todos
      .filter(todo => !!todo.completedDateTime)
      .filter(todo => !todo.deleteTime)
      .reverse()
      .sortBy('completedDateTime')
  }

  static async findReminderOn(): Promise<Todo[]> {
    return db.todos
      .filter(todo => todo.isReminderOn && !todo.completedDateTime)
      .filter(todo => !todo.deleteTime)
      .sortBy('reminderDateTime')
  }

  static async findAll(): Promise<Todo[]> {
    return db.todos.toArray()
  }

  /**
   * remove todo if it is a string, otherwise remove todo.id
   * @param todo
   */
  static async remove(todo: Todo | string): Promise<Todo> {
    const id = typeof todo === 'string' ? Number(todo) : todo.id
    const todoToDelete = await db.todos.get(id)
    if (!todoToDelete) {
      throw new Error(`Todo with id ${id} not found`)
    }
    await db.todos.delete(id)
    return todoToDelete
  }

  static async softRemove(todo: Todo | string): Promise<Todo> {
    const id = typeof todo === 'string' ? Number(todo) : todo.id
    const todoToDelete = await db.todos.get(id)
    if (!todoToDelete) {
      throw new Error(`Todo with id ${id} not found`)
    }
    todoToDelete.deleteTime = new Date()
    todoToDelete.needSync = true
    await db.todos.put(todoToDelete, todoToDelete.id)
    return todoToDelete
  }

  static async save(todo: Todo, needSync: boolean = true): Promise<Todo> {
    const now = new Date()
    const nowStr = now.toISOString()
    const updatedTodo = {
      ...todo,
      id: todo.id ? todo.id : now.valueOf(),
      updateTime: now,
      lastModifiedDateTime: nowStr,
    }
    updatedTodo.needSync = needSync
    await db.todos.put(updatedTodo, todo.id)
    return updatedTodo
  }
}
