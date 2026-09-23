import { defineStore } from 'pinia'
import { computed, ref, toRaw, watch } from 'vue'
import dayjs from 'dayjs'
import { useEventListener, useIntervalFn } from '@vueuse/core'
import type { Todo } from '@/data/Todo'
import { TodoUtils } from '@/utils/TodoUtils'
import { TodoRepository } from '@/data/repository/TodoRepository'
import { useTodoBroadcast } from '@/common/broadcast/useTodoBroadcast'
import { useUserStore } from '@/stores/useUserStore'
import { UserDataSync } from '@/data/sync/UserDataSync'

function cloneForBroadcast<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function sameId(a: Todo, b: Todo): boolean {
  return a.id === b.id
}

export const useTodoStore = defineStore('todo-store', () => {
  const userStore = useUserStore()
  const visible = (item: Todo) => !item.deleteTime

  const todos = ref<Todo[]>([])
  const completedTodos = ref<Todo[]>([])
  let loadTodoPromise: Promise<void> | undefined

  const { postEvent } = useTodoBroadcast({
    onSynced: () => { void loadTodo() },
    onUpdated: (todo) => {
      if (!visible(todo)) { return }
      const newTodos = [...todos.value]
      const newCompleted = [...completedTodos.value]
      const todoIndex = newTodos.findIndex(it => sameId(it, todo))
      const completedIndex = newCompleted.findIndex(it => sameId(it, todo))
      if (todo.completedDateTime) {
        if (todoIndex > -1) {
          newTodos.splice(todoIndex, 1)
        }
        if (completedIndex > -1) {
          newCompleted.splice(completedIndex, 1, todo)
        }
        else {
          newCompleted.unshift(todo)
        }
      }
      else {
        if (completedIndex > -1) {
          newCompleted.splice(completedIndex, 1)
        }
        if (todoIndex > -1) {
          newTodos.splice(todoIndex, 1, todo)
        }
        else {
          newTodos.unshift(todo)
          sortTodosInPlace(newTodos)
        }
      }
      todos.value = newTodos
      completedTodos.value = newCompleted
    },
    onInserted: (todo) => {
      if (!visible(todo)) { return }
      const todoExists = todos.value.some(it => sameId(it, todo))
      const completedExists = completedTodos.value.some(it => sameId(it, todo))
      if (todo.completedDateTime) {
        if (!completedExists) {
          completedTodos.value = [todo, ...completedTodos.value]
        }
      }
      else {
        if (!todoExists && !completedExists) {
          const list = [...todos.value, todo]
          sortTodosInPlace(list)
          todos.value = list
        }
      }
    },
    onDeleted: (todo) => {
      todos.value = todos.value.filter(it => !sameId(it, todo))
      completedTodos.value = completedTodos.value.filter(it => !sameId(it, todo))
    },
  })

  const syncing = computed(() => UserDataSync.busy.value)

  const find = async (id: string | number, includeCompleted: boolean = true) => {
    const item = await TodoRepository.findOne({ id, includeComplete: includeCompleted })
    return item && visible(item) ? item : undefined
  }

  const loadTodo = async () => {
    if (loadTodoPromise) { return loadTodoPromise }
    loadTodoPromise = (async () => {
      try {
        const [completedList, uncompletedList] = await Promise.all([
          TodoRepository.findCompleted(),
          TodoRepository.findUncompleted(),
        ])
        const filteredCompleted = completedList.filter(visible)
        const filteredUncompleted = uncompletedList.filter(visible)
        sortTodosInPlace(filteredUncompleted)
        completedTodos.value = filteredCompleted
        todos.value = filteredUncompleted
      }
      finally {
        loadTodoPromise = undefined
      }
    })()
    return loadTodoPromise
  }

  const sortTodosInPlace = (list: Todo[]) => {
    list.sort((a, b) => {
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
    todos.value = todos.value.filter(it => !sameId(it, todo))
    completedTodos.value = completedTodos.value.filter(it => !sameId(it, todo))
    await TodoRepository.softRemove(todo)
    postEvent({ type: 'delete', todo: cloneForBroadcast(todo) })
    await sync()
  }

  async function finishTodo(rawTodo: Todo) {
    const todo = toRaw(rawTodo)
    todos.value = todos.value.filter(it => !sameId(it, todo))
    todo.completedDateTime = new Date().toISOString()
    const completedTodo = await TodoRepository.save(todo)
    completedTodos.value = [completedTodo, ...completedTodos.value]

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
    await UserDataSync.sync()
    await loadTodo()
  }

  async function reTodo(rawTodo: Todo) {
    const todo = toRaw(rawTodo)
    todo.completedDateTime = undefined
    const uncompletedTodo = await TodoRepository.save(todo)
    completedTodos.value = completedTodos.value.filter(it => !sameId(it, todo))
    const list = [...todos.value, uncompletedTodo]
    sortTodosInPlace(list)
    todos.value = list

    postEvent({ type: 'update', todo: cloneForBroadcast(uncompletedTodo) })

    await sync()
  }

  async function saveTodo(rawTodo: Todo, options?: {
    sort: boolean
    broadcast: boolean
  }) {
    const sort = options?.sort ?? true
    const broadcast = options?.broadcast ?? true
    const todo = await TodoRepository.save(toRaw(rawTodo))
    const isUpdate = todos.value.some(it => sameId(it, todo))
    const list = [...todos.value.filter(it => !sameId(it, todo)), todo]
    if (sort) {
      sortTodosInPlace(list)
    }
    todos.value = list

    if (broadcast) {
      postEvent({
        type: isUpdate ? 'update' : 'insert',
        todo: cloneForBroadcast(todo),
      })
    }

    await sync()
  }

  async function save() {
    for (const todo of todos.value) {
      await TodoRepository.save(toRaw(todo))
    }
    await sync()
  }

  watch(UserDataSync.revision, () => {
    void loadTodo()
    postEvent({ type: 'sync' })
  })
  watch(() => userStore.userId, () => {
    todos.value = []
    completedTodos.value = []
    void loadTodo()
  }, { flush: 'sync' })
  useIntervalFn(() => { void sync() }, 5 * 60 * 1000)
  useEventListener(window, 'online', () => { void sync() })
  void loadTodo().then(sync)

  return {
    sync,
    syncError: UserDataSync.error,
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
