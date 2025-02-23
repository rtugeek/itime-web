import { defineStore } from 'pinia'
import { reactive, toRaw } from 'vue'
import consola from 'consola'
import dayjs from 'dayjs'
import { completeStorage, todoListStorage } from '@/data/db'
import type { Todo } from '@/data/Todo'
import { useUserStore } from '@/stores/useUserStore'
import { TodoApi } from '@/api/TodoApi'
import { TodoUtils } from '@/utils/TodoUtils'
import { TodoRepository } from '@/data/repository/TodoRepository'
import { useTodoBroadcast } from '@/common/broadcast/useTodoBroadcast'

const MIGRATION_KEY = 'todo_repository_migrated'

export const useTodoStore = defineStore('todo-store', () => {
  const todos = reactive<Todo[]>([])
  const completedTodos = reactive<Todo[]>([])
  const userStore = useUserStore()
  const todoRepository = new TodoRepository()
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
    return todoRepository.findOne({ id, includeComplete: includeCompleted })
  }

  const loadTodo = async () => {
    completedTodos.splice(0, completedTodos.length)
    todos.splice(0, todos.length)

    const completedList = await todoRepository.findCompleted()
    completedTodos.push(...completedList)

    const uncompletedList = await todoRepository.findUncompleted()
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
            await todoRepository.update(todo)
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
    const needUploadTodos = await todoRepository.findTableIdIsNull()
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
        return dayjs(b.createdDateTime).diff(dayjs(a.createdDateTime), 'seconds')
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
    await todoRepository.remove(todo)
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
        await todoRepository.update(todo)
      }
    }
  }

  async function finishTodo(rawTodo: Todo) {
    const todo = toRaw(rawTodo)
    const index = todos.findIndex(it => it.id === todo.id)
    if (index > -1) {
      todos.splice(index, 1)
    }
    const completedTodo = await todoRepository.complete(todo)
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
    const uncompletedTodo = await todoRepository.undoComplete(todo)
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

    await todoRepository.update(todo)
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
      await todoRepository.update(toRaw(todo))
    }
  }

  /**
   * 迁移旧数据到新的 Dexie 数据库
   */
  const migrate = async () => {
    // 检查是否已经迁移过
    if (localStorage.getItem(MIGRATION_KEY)) {
      consola.info('Data already migrated to Dexie')
      return
    }

    consola.info('Starting migration to Dexie...')

    try {
      // 迁移未完成的任务
      const todoListKeys = await todoListStorage.keys()
      for (const key of todoListKeys) {
        const todo = await todoListStorage.getItem<Todo>(key)
        if (todo) {
          const { id, createdDateTime, lastModifiedDateTime, ...todoData } = todo
          await todoRepository.add({
            ...todoData,
            order: todo.order || 0,
            isReminderOn: todo.isReminderOn || false,
            sync: false,
          })
          consola.info(`Migrated uncompleted todo: ${todo.id}`)
        }
      }

      // 迁移已完成的任务
      const completedKeys = await completeStorage.keys()
      for (const key of completedKeys) {
        const todo = await completeStorage.getItem<Todo>(key)
        if (todo) {
          const { id, createdDateTime, lastModifiedDateTime, ...todoData } = todo
          await todoRepository.add({
            ...todoData,
            order: todo.order || 0,
            isReminderOn: todo.isReminderOn || false,
            sync: false,
          })
          consola.info(`Migrated completed todo: ${todo.id}`)
        }
      }

      // 标记迁移完成
      localStorage.setItem(MIGRATION_KEY, 'true')
      consola.info('Migration to Dexie completed successfully')

      // 清理旧数据
      await todoListStorage.clear()
      await completeStorage.clear()
      consola.info('Old storage cleared')
    }
    catch (error) {
      consola.error('Migration failed:', error)
      // 迁移失败时删除标记，以便下次重试
      localStorage.removeItem(MIGRATION_KEY)
      throw error
    }
  }

  // 在 store 初始化时执行迁移
  migrate().catch(e => consola.error('Migration error:', e))

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
