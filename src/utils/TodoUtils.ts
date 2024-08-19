import dayjs from 'dayjs'
import { type ITodo, Todo } from '@/data/Todo'
import { RRuleUtils } from '@/utils/RRuleUtils'

export class TodoUtils {
  static recurrent(todo: ITodo): Todo | undefined {
    if (todo.recurrence) {
      const date = RRuleUtils.next(todo.recurrence, dayjs(todo.dueDateTime).toDate())
      if (date) {
        const now = new Date()
        return Todo.fromObject({
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
}
