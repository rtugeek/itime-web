import { defineStore } from 'pinia'
import { computed, reactive, watch } from 'vue'
import consola from 'consola'
import { useBroadcastChannel } from '@vueuse/core'
import dayjs from 'dayjs'
import { completeStorage, todoListStorage } from '@/data/db'
import type { ITodo, TodoUpdate } from '@/data/Todo'
import { Todo } from '@/data/Todo'
import { useUserStore } from '@/stores/useUserStore'
import { TodoApi } from '@/api/TodoApi'
import { AppConfig } from '@/common/AppConfig'

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
      if (payload.type == 'insert') {
        todos.splice(0, 0, todo)
        sortTodos()
      }
      else if (payload.type == 'update') {
        const findIndex = todos.findIndex(it => it.id == todo.id)
        if (findIndex > -1) {
          todos[findIndex] = todo
        }
      }
      else if (payload.type == 'delete') {
        todos.splice(todos.findIndex(it => it.id == todo.id), 1)
      }
    }
  })

  const sortedTodos = computed(() => {
    return todos.sort((a, b) => a.order - b.order)
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

  loadTodo()

  function deleteTodo(todo: Todo) {
    todos.splice(todos.indexOf(todo), 1)
    todoListStorage.removeItem(`${todo.id}`)
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
    completedTodos.splice(0, 0, rawTodo)
    await completeStorage.setItem(`${todo.id}`, todo)
    await todoListStorage.removeItem(`${todo.id}`)
    updateRemoteTodo(todo).catch()
  }

  async function reTodo(rawTodo: Todo) {
    const todo = rawTodo.toCloneable ? rawTodo.toCloneable() : rawTodo
    todo.completedDateTime = undefined
    todo.order = 0
    completedTodos.splice(completedTodos.indexOf(todo), 1)
    todos.splice(0, 0, todo)
    const id = todo.id
    await completeStorage.removeItem(`${id}`)
    await todoListStorage.setItem(`${id}`, todo)
    updateRemoteTodo(todo).catch()
  }

  async function saveTodo(data: TodoUpdate) {
    if (data.todoId) {
      const findIndex = todos.findIndex(it => it.id == data.todoId)
      if (findIndex > -1) {
        const editTodo = todos[findIndex]
        editTodo.title = data.title
        broadcastChannel.post({ type: 'update', todo: editTodo.toCloneable() })
        await todoListStorage.setItem(`${editTodo.id}`, editTodo.toCloneable())
        try {
          await updateRemoteTodo(editTodo)
        }
        catch (e) {
          consola.error(e)
        }
      }
    }
    else {
      const todo = new Todo(data.title)
      todos.splice(0, 0, todo)
      broadcastChannel.post({ type: 'insert', todo: todo.toCloneable() })
      await todoListStorage.setItem(`${todo.id}`, todo.toCloneable())
      try {
        await updateRemoteTodo(todo)
      }
      catch (e) {
        consola.error(e)
      }
    }
  }

  const save = () => {
    for (const todo of todos) {
      todoListStorage.setItem(`${todo.id}`, todo.toCloneable())
    }
  }

  return {
    deleteTodo,
    save,
    saveTodo,
    todos,
    find,
    reTodo,
    sortedTodos,
    finishedTodos: completedTodos,
    finishTodo,
  }
})
