import Dexie, { type Table } from 'dexie'
import type { Todo } from '@/data/Todo'

export class TodoDatabase extends Dexie {
  todos!: Table<Todo>

  constructor() {
    super('todo-v1')

    this.version(1).stores({
      todos: '++id, title, createdDateTime, tableId, lastModifiedDateTime, completedDateTime, isReminderOn, dueDateTime, reminderDateTime, importance, order',
    })
  }
}

const db = new TodoDatabase()
export class TodoRepository {
  async findOne(options: { id: string, includeComplete?: boolean }): Promise<Todo | undefined> {
    const todo = await db.todos.get(Number(options.id))
    if (!todo) { return undefined }

    if (!options.includeComplete && todo.completedDateTime) {
      return undefined
    }

    return todo
  }

  async findUncompleted(): Promise<Todo[]> {
    return db.todos
      .filter(todo => !todo.completedDateTime)
      .sortBy('order')
  }

  async findCompleted(): Promise<Todo[]> {
    return db.todos
      .filter(todo => !!todo.completedDateTime)
      .reverse()
      .sortBy('completedDateTime')
  }

  async findReminderOn(): Promise<Todo[]> {
    return db.todos
      .filter(todo => todo.isReminderOn && !todo.completedDateTime)
      .sortBy('reminderDateTime')
  }

  async complete(todo: Todo): Promise<Todo> {
    const now = new Date().toISOString()
    const updatedTodo = {
      ...todo,
      completedDateTime: now,
      lastModifiedDateTime: now,
    }
    await db.todos.put(updatedTodo)
    return updatedTodo
  }

  async undoComplete(todo: Todo): Promise<Todo> {
    const updatedTodo = {
      ...todo,
      completedDateTime: undefined,
      lastModifiedDateTime: new Date().toISOString(),
    }
    await db.todos.put(updatedTodo)
    return updatedTodo
  }

  /**
   * remove todo if it is a string, otherwise remove todo.id
   * @param todo
   */
  async remove(todo: Todo | string): Promise<Todo> {
    const id = typeof todo === 'string' ? Number(todo) : todo.id
    const todoToDelete = await db.todos.get(id)
    if (!todoToDelete) {
      throw new Error(`Todo with id ${id} not found`)
    }
    await db.todos.delete(id)
    return todoToDelete
  }

  async add(todo: Omit<Todo, 'id' | 'createdDateTime' | 'lastModifiedDateTime'>): Promise<Todo> {
    const now = new Date().toISOString()
    const newTodo: Todo = {
      ...todo,
      createdDateTime: now,
      lastModifiedDateTime: now,
      id: await db.todos.add({
        ...todo,
        createdDateTime: now,
        lastModifiedDateTime: now,
      } as Todo) as number,
    }
    return newTodo
  }

  async update(todo: Todo): Promise<Todo> {
    const updatedTodo = {
      ...todo,
      lastModifiedDateTime: new Date().toISOString(),
    }
    await db.todos.put(updatedTodo)
    return updatedTodo
  }

  async findTableIdIsNull(): Promise<Todo[]> {
    return db.todos
      .filter(todo => !todo.tableId)
      .sortBy('order')
  }
}
