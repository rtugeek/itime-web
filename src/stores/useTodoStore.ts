import { defineStore } from 'pinia'
import { reactive, ref, toRaw } from 'vue'
import dayjs from 'dayjs'
import type { Todo } from '@/data/Todo'
import { TodoUtils } from '@/utils/TodoUtils'
import { TodoRepository } from '@/data/repository/TodoRepository'
import { useTodoBroadcast } from '@/common/broadcast/useTodoBroadcast'
import { TodoSync } from '@/data/sync/TodoSync'

function cloneForBroadcast<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function sameId(a: Todo, b: Todo): boolean {
  return String(a.id) === String(b.id)
}

export const useTodoStore = defineStore('todo-store', () => {
  const todos = reactive<Todo[]>([])
  const completedTodos = reactive<Todo[]>([])
  const { postEvent } = useTodoBroadcast({
    onUpdated: (todo) => {
      const todoIndex = todos.findIndex(it => sameId(it, todo))
      const completedIndex = completedTodos.findIndex(it => sameId(it, todo))
      if (todo.completedDateTime) {
        if (todoIndex > -1) {
          todos.splice(todoIndex, 1)
        }
        if (completedIndex > -1) {
          completedTodos.splice(completedIndex, 1, todo)
        }
        else {
          completedTodos.splice(0, 0, todo)
        }
      }
      else {
        if (completedIndex > -1) {
          completedTodos.splice(completedIndex, 1)
        }
        if (todoIndex > -1) {
          todos.splice(todoIndex, 1, todo)
        }
        else {
          todos.splice(0, 0, todo)
          sortTodos()
        }
      }
    },
    onInserted: (todo) => {
      const todoIndex = todos.findIndex(it => sameId(it, todo))
      const completedIndex = completedTodos.findIndex(it => sameId(it, todo))
      if (todo.completedDateTime) {
        if (completedIndex === -1) {
          completedTodos.splice(0, 0, todo)
        }
      }
      else {
        if (todoIndex === -1 && completedIndex === -1) {
          todos.splice(0, 0, todo)
          sortTodos()
        }
      }
    },
    onDeleted: (todo) => {
      const todoIndex = todos.findIndex(it => sameId(it, todo))
      if (todoIndex > -1) {
        todos.splice(todoIndex, 1)
      }
      const completedIndex = completedTodos.findIndex(it => sameId(it, todo))
      if (completedIndex > -1) {
        completedTodos.splice(completedIndex, 1)
      }
    },
  })
  const syncing = ref(false)
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
    const todoIndex = todos.findIndex(it => sameId(it, todo))
    if (todoIndex > -1) {
      todos.splice(todoIndex, 1)
    }
    const completedIndex = completedTodos.findIndex(it => sameId(it, todo))
    if (completedIndex > -1) {
      completedTodos.splice(completedIndex, 1)
    }
    await TodoRepository.softRemove(todo)
    postEvent({ type: 'delete', todo: cloneForBroadcast(todo) })
    await sync()
  }

  async function finishTodo(rawTodo: Todo) {
    const todo = toRaw(rawTodo)
    const index = todos.findIndex(it => sameId(it, todo))
    if (index > -1) {
      todos.splice(index, 1)
    }
    todo.completedDateTime = new Date().toISOString()
    const completedTodo = await TodoRepository.save(todo)
    completedTodos.splice(0, 0, completedTodo)

    postEvent({ type: 'update', todo: cloneForBroadcast(completedTodo) })

    if (todo.recurrence) {
      const nextTodo = TodoUtils.recurrent(todo)
      if (nextTodo) {
        await saveTodo(nextTodo)
      }
    }
    await sync()
  }

  async function sync() {
    syncing.value = true
    try {
      await TodoSync.sync()
    }
    finally {
      syncing.value = false
    }
  }

  async function reTodo(rawTodo: Todo) {
    const todo = toRaw(rawTodo)
    todo.completedDateTime = undefined
    const uncompletedTodo = await TodoRepository.save(todo)
    const index = completedTodos.findIndex(it => sameId(it, todo))
    if (index > -1) {
      completedTodos.splice(index, 1)
    }
    todos.splice(0, 0, uncompletedTodo)
    sortTodos()

    postEvent({ type: 'update', todo: cloneForBroadcast(uncompletedTodo) })

    await sync()
  }

  async function saveTodo(rawTodo: Todo, options?: {
    sort: boolean
    broadcast: boolean
  }) {
    const sort = options?.sort ?? true
    const broadcast = options?.broadcast ?? true
    const todo = toRaw(rawTodo)

    await TodoRepository.save(todo)
    const index = todos.findIndex(it => sameId(it, todo))
    if (index > -1) {
      todos.splice(index, 1, todo)
    }
    else {
      todos.splice(0, 0, todo)
    }

    if (broadcast) {
      postEvent({
        type: index > -1 ? 'update' : 'insert',
        todo: cloneForBroadcast(todo),
      })
    }
    if (sort) {
      sortTodos()
    }

    await sync()
  }

  async function save() {
    for (const todo of todos) {
      await TodoRepository.save(toRaw(todo))
    }
    await sync()
  }

  loadTodo()

  return {
    deleteTodo,
    saveTodo,
    todos,
    find,
    save,
    reTodo,
    syncing,
    completedTodos,
    finishTodo,
  }
})
