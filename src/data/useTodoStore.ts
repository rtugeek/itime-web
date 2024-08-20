import { defineStore } from 'pinia'
import { reactive, toRaw, watch } from 'vue'
import consola from 'consola'
import { useBroadcastChannel } from '@vueuse/core'
import dayjs from 'dayjs'
import { completeStorage, todoListStorage } from '@/data/db'
import type { Todo } from '@/data/Todo'
import { useUserStore } from '@/stores/useUserStore'
import { TodoApi } from '@/api/TodoApi'
import { AppConfig } from '@/common/AppConfig'
import { TodoUtils } from '@/utils/TodoUtils'

interface TodoEvent {
  type: 'insert' | 'update' | 'delete'
  todo: Todo
}
export const useTodoStore = defineStore('todo-store', () => {
  const todos = reactive<Todo[]>([])
  const completedTodos = reactive<Todo[]>([])
  const userStore = useUserStore()
  const broadcastChannel = useBroadcastChannel({
    name: AppConfig.CHANNEL_TODO,
  })

  watch(broadcastChannel.data, () => {
    consola.info('broadcastChannel.data', broadcastChannel.data.value)
    const payload = broadcastChannel.data.value as (TodoEvent | undefined)
    if (payload) {
      const todo = payload.todo
      if (payload.type == 'update') {
        const findIndex = todos.findIndex(it => it.id == todo.id)
        if (findIndex > -1) {
          todos[findIndex] = todo
        }
        else {
          todos.splice(0, 0, todo)
          sortTodos()
        }
      }
      else if (payload.type == 'delete') {
        todos.splice(todos.findIndex(it => it.id == todo.id), 1)
      }
    }
  })

  const find = async (id: string, includeCompleted: boolean = true) => {
    let todo = await todoListStorage.getItem<Todo>(id)
    if (todo) {
      return todo
    }
    if (includeCompleted) {
      todo = await completeStorage.getItem<Todo>(id)
      if (todo) {
        return todo
      }
    }
    return undefined
  }

  const loadTodo = async () => {
    completedTodos.splice(0, completedTodos.length)
    todos.splice(0, todos.length)
    const keys = await completeStorage.keys()
    for (const key of keys) {
      const todo = await completeStorage.getItem<Todo>(key)
      if (todo) {
        completedTodos.push(todo)
      }
    }

    const todoListKeys = await todoListStorage.keys()
    for (const key of todoListKeys) {
      const todo = await todoListStorage.getItem<Todo>(key)
      if (todo) {
        todos.push(todo)
      }
    }
    sortTodos()
  }

  const sync = async () => {
    const todos = await TodoApi.getTodos()
    // 先不处理已经完成的任务
    const uncompletedTodos = todos.data.filter(it => !it.completedDateTime)
    let changed = false
    for (const todo of uncompletedTodos) {
      // 先判断本地是否存在
      if (todo) {
        const localTodo = await find(todo.id, false)
        if (localTodo) {
          if (dayjs(localTodo.lastModifiedDateTime).isBefore(dayjs(todo.lastModifiedDateTime))) {
            const index = todos.findIndex(it => it.id == todo.id)
            todos.splice(index, 1, localTodo)
            consola.info('update todo from server', todo)
            changed = true
          }
        }
        else {
          changed = true
          consola.info('create todo from server', todo)
          await saveTodo(todo, { sort: false, broadcast: false })
        }
      }
    }
    if (changed) {
      sortTodos()
    }
  }

  const sortTodos = () => {
    todos.sort((a, b) => {
      const diff = a.order - b.order
      if (diff == 0) {
        return dayjs(b.createdDateTime).diff(dayjs(a.createdDateTime), 'seconds')
      }
      return diff
    })
  }

  function deleteTodo(todo: Todo) {
    const todoIndex = todos.findIndex(it => it.id == todo.id)
    if (todoIndex > -1) {
      todos.splice(todoIndex, 1)
    }
    const completedIndex = completedTodos.findIndex(it => it.id == todo.id)
    if (completedIndex > -1) {
      completedTodos.splice(completedIndex, 1)
    }
    todoListStorage.removeItem(`${todo.id}`)
    completeStorage.removeItem(`${todo.id}`)
    if (userStore.isLogin) {
      TodoApi.delete(todo.id)
    }
  }

  async function updateRemoteTodo(todo: Todo) {
    if (userStore.isLogin) {
      const webTodo = await TodoApi.save(todo)
      if (!todo.tableId) {
        todo.tableId = webTodo.tableId
        await completeStorage.setItem(`${todo.id}`, todo)
      }
    }
  }

  async function finishTodo(rawTodo: Todo) {
    const todo = toRaw(rawTodo)
    todos.splice(todos.findIndex(it => it.id == rawTodo.id), 1)
    todo.completedDateTime = new Date().toISOString()
    completedTodos.splice(0, 0, todo)
    await completeStorage.setItem(`${todo.id}`, todo)
    await todoListStorage.removeItem(`${todo.id}`)
    updateRemoteTodo(todo).catch()
    if (todo.recurrence) {
      const nextTodo = TodoUtils.recurrent(todo)
      if (nextTodo) {
        await saveTodo(nextTodo)
      }
    }
  }

  async function reTodo(rawTodo: Todo) {
    const todo = toRaw(rawTodo)
    todo.completedDateTime = undefined
    todo.order = 0
    const index = completedTodos.findIndex(it => it.id == rawTodo.id)
    completedTodos.splice(index, 1)
    todos.splice(0, 0, todo)
    const id = todo.id
    await completeStorage.removeItem(`${id}`)
    await todoListStorage.setItem(`${id}`, todo)
    updateRemoteTodo(todo).catch()
  }

  async function saveTodo(rawTodo: Todo, options?: {
    sync: boolean
    sort: boolean
    broadcast: boolean
  }) {
    const sync = options?.sync ?? true
    const sort = options?.sort ?? true
    const broadcast = options?.broadcast ?? true
    const todo = toRaw(rawTodo)
    await todoListStorage.setItem(`${todo.id}`, todo)
    todos.splice(0, 0, todo)
    if (broadcast) {
      broadcastChannel.post({ type: 'update', todo })
    }
    if (sync) {
      try {
        await updateRemoteTodo(todo)
      }
      catch (e) {
        consola.error('updateRemoteTodo', e)
      }
    }
    if (sort) {
      sortTodos()
    }
  }

  async function save() {
    for (const todo of todos) {
      await todoListStorage.setItem(`${todo.id}`, toRaw(todo))
    }
  }

  loadTodo()

  return {
    deleteTodo,
    saveTodo,
    todos,
    find,
    sync,
    save,
    reTodo,
    completedTodos,
    finishTodo,
  }
})
