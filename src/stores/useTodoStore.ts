import { defineStore } from 'pinia'
import { reactive, toRaw } from 'vue'
import dayjs from 'dayjs'
import type { Todo } from '@/data/Todo'
import { TodoUtils } from '@/utils/TodoUtils'
import { TodoRepository } from '@/data/repository/TodoRepository'
import { useTodoBroadcast } from '@/common/broadcast/useTodoBroadcast'
import { TodoSync } from '@/data/sync/TodoSync'

export const useTodoStore = defineStore('todo-store', () => {
  const todos = reactive<Todo[]>([])
  const completedTodos = reactive<Todo[]>([])
  const { postEvent } = useTodoBroadcast({
    onUpdated: (todo) => {
      const findIndex = todos.findIndex(it => it.id === todo.id)
      if (findIndex > -1) {
        todos[findIndex] = todo
      }
      else {
        todos.splice(0, 0, todo)
        sortTodos()
      }
    },
    onInserted: (todo) => {
      todos.splice(0, 0, todo)
      sortTodos()
    },
    onDeleted: (todo) => {
      const index = todos.findIndex(it => it.id === todo.id)
      if (index > -1) {
        todos.splice(index, 1)
      }
    },
  })

  const find = async (id: string | number, includeCompleted: boolean = true) => {
    return TodoRepository.findOne({ id, includeComplete: includeCompleted })
  }

  const loadTodo = async () => {
    completedTodos.splice(0, completedTodos.length)
    todos.splice(0, todos.length)

    const completedList = await TodoRepository.findCompleted()
    completedTodos.push(...completedList)

    const uncompletedList = await TodoRepository.findUncompleted()
    todos.push(...uncompletedList)

    sortTodos()
  }

  const sortTodos = () => {
    todos.sort((a, b) => {
      const diff = a.order - b.order
      if (diff === 0) {
        if (b.dueDateTime && a.dueDateTime == undefined) {
          return 1
        }
        else if (a.dueDateTime && b.dueDateTime == undefined) {
          return -1
        }
        else if (a.dueDateTime == undefined && b.dueDateTime == undefined) {
          return dayjs(b.createdDateTime).diff(dayjs(a.createdDateTime), 'seconds')
        }
        else if (a.dueDateTime && b.dueDateTime) {
          return dayjs(a.dueDateTime).diff(dayjs(b.dueDateTime), 'seconds')
        }
      }
      return diff
    })
  }

  async function deleteTodo(todo: Todo) {
    const todoIndex = todos.findIndex(it => it.id === todo.id)
    if (todoIndex > -1) {
      todos.splice(todoIndex, 1)
    }
    const completedIndex = completedTodos.findIndex(it => it.id === todo.id)
    if (completedIndex > -1) {
      completedTodos.splice(completedIndex, 1)
    }
    await TodoRepository.softRemove(todo)
    postEvent({ type: 'delete', todo: { ...todo } })
    await TodoSync.sync()
  }

  async function finishTodo(rawTodo: Todo) {
    const todo = toRaw(rawTodo)
    const index = todos.findIndex(it => it.id === todo.id)
    if (index > -1) {
      todos.splice(index, 1)
    }
    todo.completedDateTime = new Date().toISOString()
    const completedTodo = await TodoRepository.save(todo)
    completedTodos.splice(0, 0, completedTodo)

    // updateRemoteTodo(completedTodo).catch(consola.error)

    if (todo.recurrence) {
      const nextTodo = TodoUtils.recurrent(todo)
      if (nextTodo) {
        await saveTodo(nextTodo)
      }
    }
    await TodoSync.sync()
  }

  async function reTodo(rawTodo: Todo) {
    const todo = toRaw(rawTodo)
    todo.completedDateTime = undefined
    const uncompletedTodo = await TodoRepository.save(todo)
    const index = completedTodos.findIndex(it => it.id === todo.id)
    if (index > -1) {
      completedTodos.splice(index, 1)
    }
    todos.splice(0, 0, uncompletedTodo)
    await TodoSync.sync()
    // updateRemoteTodo(uncompletedTodo).catch(consola.error)
  }

  async function saveTodo(rawTodo: Todo, options?: {
    sort: boolean
    broadcast: boolean
  }) {
    const sort = options?.sort ?? true
    const broadcast = options?.broadcast ?? true
    const todo = toRaw(rawTodo)

    await TodoRepository.save(todo)
    const index = todos.findIndex(it => it.id === todo.id)
    if (index > -1) {
      todos[index] = todo
    }
    else {
      todos.splice(0, 0, todo)
    }

    if (broadcast) {
      postEvent({
        type: index > -1 ? 'update' : 'insert',
        todo,
      })
    }
    if (sort) {
      sortTodos()
    }

    await TodoSync.sync()
  }

  async function save() {
    for (const todo of todos) {
      await TodoRepository.save(toRaw(todo))
    }
    await TodoSync.sync()
  }

  // 在 store 初始化时执行迁移
  // 迁移完成后加载数据
  loadTodo()

  return {
    deleteTodo,
    saveTodo,
    todos,
    find,
    save,
    reTodo,
    completedTodos,
    finishTodo,
  }
})
