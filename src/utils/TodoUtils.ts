import dayjs from 'dayjs'
import { nanoid } from 'nanoid'
import type { ITodo } from '@/data/Todo'
import { RRuleUtils } from '@/utils/RRuleUtils'

export class TodoUtils {
  static recurrent(todo: ITodo): ITodo | undefined {
    if (todo.recurrence) {
      const dueDate = dayjs(todo.dueDateTime)
      const date = RRuleUtils.next(todo.recurrence, dueDate.toDate(), dueDate.isSame(dayjs(), 'day') ? undefined : dueDate.toDate())
      if (date) {
        const now = new Date()
        const id = nanoid()
        return this.fromObject({
          ...todo,
          id,
          needSync: true,
          lastSyncedAt: undefined,
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

  static fromObject(json: object): ITodo {
    const todo = this.new()
    Object.assign(todo, json)
    return todo
  }

  static new(title: string = ''): ITodo {
    const now = new Date()
    const id = nanoid()
    const todo: ITodo = {
      title,
      createdDateTime: now.toISOString(),
      lastModifiedDateTime: now.toISOString(),
      id,
      isReminderOn: false,
      order: 0,
      importance: 'normal',
    }
    return todo
  }
}
