import { customAlphabet } from 'nanoid'

/**
 * https://learn.microsoft.com/zh-cn/graph/api/resources/todotask?view=graph-rest-1.0
 */
export class Todo {
  id: string | number
  createdDateTime: string
  title: string
  order = 0
  /**
   *  任务要完成的指定时区中的日期和时间。
   */
  dueDateTime?: Date
  /**
   * The date and time in the specified time zone for a reminder alert of the task to occur.
   */
  reminderDateTime?: Date
  /**
   * The date and time in the specified time zone at which the task is to be completed.
   */
  completedDateTime?: Date
  /**
   * 任务的重要性。 可取值为：low、normal、high。
   */
  importance?: 'low' | 'normal' | 'high'
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
  isReminderOn = false

  constructor(title: string) {
    this.title = title
    this.createdDateTime = new Date().toISOString()
    this.lastModifiedDateTime = new Date().toISOString()
    this.dueDateTime = undefined
    this.id = Number.parseInt(customAlphabet('0123456789', 10)())
  }

  isFinished = (): boolean => {
    return this.dueDateTime != undefined
  }

  static fromJSON(json: object) {
    const todo = new Todo('')
    Object.assign(todo, json)
    return todo
  }
}

export interface TodoUpdate {
  title: string
  todoId?: string
}
