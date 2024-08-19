export type TodoImportance = 'low' | 'normal' | 'high'
export interface ITodo {
  tableId?: string | number
  /**
   * 任务的标识符。 可以是任何唯一的字符串。
   */
  id: number
  createdDateTime: string
  title: string
  order: number
  /**
   *  任务要完成的指定时区中的日期和时间。
   */
  dueDateTime?: string
  /**
   * 任务预计完成的时间。
   */
  reminderDateTime?: string
  /**
   * 任务实际完成的时间。
   */
  completedDateTime?: string
  /**
   * 任务的重要性。 可取值为：low、normal、high。
   */
  importance?: TodoImportance
  /**
   * The recurrence pattern for the task.
   */
  recurrence?: string
  /**
   * The date and time in the specified time zone at which the task is scheduled to start.
   */
  startDateTime?: string
  /**
   * The date and time when the task was last modified.
   * @example midnight UTC on Jan 1, 2020 would look like this: '2020-01-01T00:00:00Z'.
   */
  lastModifiedDateTime: string
  /**
   * 如果设置警报以提醒用户有任务，则设置为 true。
   */
  isReminderOn: boolean
}
/**
 * https://learn.microsoft.com/zh-cn/graph/api/resources/todotask?view=graph-rest-1.0
 */
export class Todo implements ITodo {
  createdDateTime: string
  id: number
  isReminderOn = false
  lastModifiedDateTime: string
  order = 0
  title: string
  completedDateTime: string | undefined
  dueDateTime: string | undefined
  importance: TodoImportance = 'normal'
  recurrence?: string
  reminderDateTime?: string
  startDateTime?: string
  tableId?: string | number

  constructor(title: string) {
    this.title = title
    const now = new Date()
    this.createdDateTime = now.toISOString()
    this.lastModifiedDateTime = now.toISOString()
    this.dueDateTime = undefined
    this.id = now.getTime()
  }

  static fromObject(json: object): Todo {
    const todo = new Todo('')
    Object.assign(todo, json)
    return todo
  }

  static fromJSON(json: string): Todo {
    const todo = new Todo('')
    Object.assign(todo, JSON.parse(json))
    return todo
  }

  toCloneable() {
    return JSON.parse(JSON.stringify(this))
  }
}
