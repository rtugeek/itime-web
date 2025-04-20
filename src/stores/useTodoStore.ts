import { defineStore } from 'pinia'
import { reactive, toRaw } from 'vue'
import consola from 'consola'
import dayjs from 'dayjs'
import { migrateTodo } from '@/data/db'
import type { Todo } from '@/data/Todo'
import { useUserStore } from '@/stores/useUserStore'
import { TodoApi } from '@/api/TodoApi'
import { TodoUtils } from '@/utils/TodoUtils'
import { TodoRepository } from '@/data/repository/TodoRepository'
import { useTodoBroadcast } from '@/common/broadcast/useTodoBroadcast'

export const useTodoStore = defineStore('todo-store', () => {
  const todos = reactive<Todo[]>([])
  const completedTodos = reactive<Todo[]>([])
  const userStore = useUserStore()
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

  const find = async (id: string, includeCompleted: boolean = true) => {
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

  const sync = async () => {
    if (!userStore.isLogin) {
      return
    }
    const response = await TodoApi.getTodos()
    // 先不处理服务器上，已经完成的todo
    const uncompletedTodos = response.data.filter(it => !it.completedDateTime)
    let changed = false
    for (const todo of uncompletedTodos) {
      if (todo) {
        const localTodo = await find(todo.id.toString(), false)
        if (localTodo) {
          if (dayjs(localTodo.lastModifiedDateTime).isBefore(dayjs(todo.lastModifiedDateTime))) {
            await TodoRepository.update(todo)
            const index = todos.findIndex(it => it.id === todo.id)
            if (index > -1) {
              todos[index] = todo
            }
            consola.info('update todo from server', todo)
            changed = true
          }
        }
        else {
          changed = true
          consola.info('create todo from server', todo)
          await saveTodo(todo, { sync: false, sort: false, broadcast: false })
        }
      }
    }
    // 将本地的todo同步到服务器
    const needUploadTodos = await TodoRepository.findTableIdIsNull()
    for (const needUploadTodo of needUploadTodos) {
      updateRemoteTodo(needUploadTodo)
    }
    if (changed) {
      sortTodos()
    }
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
    await TodoRepository.remove(todo)
    if (userStore.isLogin) {
      await TodoApi.delete(todo.id)
    }
    postEvent({ type: 'delete', todo: { ...todo } })
  }

  async function updateRemoteTodo(todo: Todo) {
    if (userStore.isLogin) {
      const webTodo = await TodoApi.save(todo)
      if (!todo.tableId) {
        todo.tableId = webTodo.tableId
        consola.info('update tableId', todo)
        await TodoRepository.update(todo)
      }
    }
  }

  async function finishTodo(rawTodo: Todo) {
    const todo = toRaw(rawTodo)
    const index = todos.findIndex(it => it.id === todo.id)
    if (index > -1) {
      todos.splice(index, 1)
    }
    const completedTodo = await TodoRepository.complete(todo)
    completedTodos.splice(0, 0, completedTodo)

    updateRemoteTodo(completedTodo).catch(consola.error)

    if (todo.recurrence) {
      const nextTodo = TodoUtils.recurrent(todo)
      if (nextTodo) {
        await saveTodo(nextTodo)
      }
    }
  }

  async function reTodo(rawTodo: Todo) {
    const todo = toRaw(rawTodo)
    const uncompletedTodo = await TodoRepository.undoComplete(todo)
    const index = completedTodos.findIndex(it => it.id === todo.id)
    if (index > -1) {
      completedTodos.splice(index, 1)
    }
    todos.splice(0, 0, uncompletedTodo)
    updateRemoteTodo(uncompletedTodo).catch(consola.error)
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

    await TodoRepository.update(todo)
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
      await TodoRepository.update(toRaw(todo))
    }
  }

  // 在 store 初始化时执行迁移
  migrateTodo().catch(e => consola.error('Migration error:', e))

  // 迁移完成后加载数据
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
