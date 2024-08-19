import { defineStore } from 'pinia'
import { reactive, watch } from 'vue'
import consola from 'consola'
import { useBroadcastChannel } from '@vueuse/core'
import dayjs from 'dayjs'
import { completeStorage, todoListStorage } from '@/data/db'
import type { ITodo } from '@/data/Todo'
import { Todo } from '@/data/Todo'
import { useUserStore } from '@/stores/useUserStore'
import { TodoApi } from '@/api/TodoApi'
import { AppConfig } from '@/common/AppConfig'
import { TodoUtils } from '@/utils/TodoUtils'

interface TodoEvent {
  type: 'insert' | 'update' | 'delete'
  todo: ITodo
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
      const todo = Todo.fromObject(payload.todo)
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

  const find = async (id: string) => {
    let todo = await todoListStorage.getItem<ITodo>(id)
    if (todo) {
      return Todo.fromObject(todo)
    }
    todo = await completeStorage.getItem<ITodo>(id)
    if (todo) {
      return Todo.fromObject(todo)
    }
    return undefined
  }

  const loadTodo = async () => {
    completedTodos.splice(0, completedTodos.length)
    todos.splice(0, todos.length)
    const keys = await completeStorage.keys()
    for (const key of keys) {
      const todo = await completeStorage.getItem<ITodo>(key)
      if (todo) {
        completedTodos.push(Todo.fromObject(todo))
      }
    }

    const todoListKeys = await todoListStorage.keys()
    for (const key of todoListKeys) {
      const todo = await todoListStorage.getItem<ITodo>(key)
      if (todo) {
        todos.push(Todo.fromObject(todo))
      }
    }
    sortTodos()
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
    const todo = rawTodo.toCloneable ? rawTodo.toCloneable() : rawTodo
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
    const todo = rawTodo.toCloneable ? rawTodo.toCloneable() : rawTodo
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

  async function saveTodo(todo: Todo) {
    broadcastChannel.post({ type: 'update', todo: todo.toCloneable() })
    await todoListStorage.setItem(`${todo.id}`, todo.toCloneable())
    updateRemoteTodo(todo).catch()
    todos.splice(0, 0, todo)
    sortTodos()
  }

  loadTodo()

  return {
    deleteTodo,
    saveTodo,
    todos,
    find,
    reTodo,
    completedTodos,
    finishTodo,
  }
})
