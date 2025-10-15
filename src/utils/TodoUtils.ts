import dayjs from 'dayjs'
import type { Todo } from '@/data/Todo'
import { RRuleUtils } from '@/utils/RRuleUtils'

export class TodoUtils {
  static recurrent(todo: Todo): Todo | undefined {
    if (todo.recurrence) {
      const dueDate = dayjs(todo.dueDateTime)
      const date = RRuleUtils.next(todo.recurrence, dueDate.toDate(), dueDate.isToday() ? undefined : dueDate.toDate())
      if (date) {
        const now = new Date()
        return this.fromObject({
          ...todo,
          id: now.getTime(),
          createdDateTime: now.toISOString(),
          lastModifiedDateTime: now.toISOString(),
          dueDateTime: date.toISOString(),
          startDateTime: date.toISOString(),
          completedDateTime: undefined,
        })
      }
    }
    return undefined
  }

  static fromObject(json: object): Todo {
    const todo = this.new()
    Object.assign(todo, json)
    return todo
  }

  static new(title: string = ''): Todo {
    const now = new Date()
    const todo: Todo = {
      title,
      createdDateTime: now.toISOString(),
      lastModifiedDateTime: now.toISOString(),
      id: now.getTime(),
      isReminderOn: false,
      order: 0,
      importance: 'normal',
    }
    return todo
  }
}
