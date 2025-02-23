export type TodoImportance = 'low' | 'normal' | 'high'
/**
 * https://learn.microsoft.com/zh-cn/graph/api/resources/todotask?view=graph-rest-1.0
 */
export interface Todo {
  tableId?: string | number
  /**
   * 任务的标识符。 可以是任何唯一的字符串。
   */
  id: number
  createdDateTime: string
  title: string
  /**
   * 排序位置
   */
  order: number
  /**
   *  任务要完成的指定时区中的日期和时间。
   */
  dueDateTime?: string
  /**
   * 提醒时间
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
