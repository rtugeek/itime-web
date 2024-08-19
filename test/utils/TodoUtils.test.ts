import { describe, it } from 'vitest'
import dayjs from 'dayjs'
import { RRuleUtils } from '../../src/utils/RRuleUtils'
import { Todo } from '../../src/data/Todo'
import { TodoUtils } from '../../src/utils/TodoUtils'

describe('todoUtils', () => {
  it('next', () => {
    const todo = new Todo('test')
    todo.dueDateTime = dayjs().add(3, 'day').toDate().toISOString()
    todo.recurrence = RRuleUtils.WEEKLY_STR
    const next = TodoUtils.recurrent(todo)
    console.log(next)
  })
})
