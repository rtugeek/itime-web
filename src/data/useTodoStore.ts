import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
import { completeStorage, todoListStorage } from '@/data/db'
import type { ITodo, TodoUpdate } from '@/data/Todo'
import { Todo } from '@/data/Todo'
import { useUserStore } from '@/stores/useUserStore'
import { TodoApi } from '@/api/TodoApi'

export const useTodoStore = defineStore('todo-store', () => {
  const todos = reactive<Todo[]>([])
  const finishedTodos = reactive<Todo[]>([])
  const userStore = useUserStore()
  const sortedTodos = computed(() => {
    return todos.sort((a, b) => a.order - b.order)
  })

  const loadTodo = async () => {
    const keys = await completeStorage.keys()
    for (const key of keys) {
      const todo = await completeStorage.getItem<ITodo>(key)
      if (todo) {
        finishedTodos.push(Todo.fromObject(todo))
      }
    }

    const todoListKeys = await todoListStorage.keys()
    for (const key of todoListKeys) {
      const todo = await todoListStorage.getItem<ITodo>(key)
      if (todo) {
        todos.push(Todo.fromObject(todo))
      }
    }

    todos.sort((a, b) => a.order - b.order)
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

  async function finishTodo(todo: Todo) {
    todos.splice(todos.indexOf(todo), 1)
    todo.completedDateTime = new Date().toISOString()
    finishedTodos.splice(0, 0, todo)
    await completeStorage.setItem(`${todo.id}`, todo)
    await todoListStorage.removeItem(`${todo.id}`)
    await updateRemoteTodo(todo)
  }

  async function reTodo(todo: Todo) {
    todo.completedDateTime = undefined
    todo.order = 0
    finishedTodos.splice(finishedTodos.indexOf(todo), 1)
    todos.splice(0, 0, todo)
    const id = todo.id
    await completeStorage.removeItem(`${id}`)
    await todoListStorage.setItem(`${id}`, todo)
    await updateRemoteTodo(todo)
  }

  async function saveTodo(data: TodoUpdate) {
    if (data.todoId) {
      const findIndex = todos.findIndex(it => it.id == data.todoId)
      if (findIndex > -1) {
        const editTodo = todos[findIndex]
        editTodo.title = data.title
        await todoListStorage.setItem(`${editTodo.id}`, editTodo.toCloneable())
        await updateRemoteTodo(editTodo)
      }
    }
    else {
      const todo = new Todo(data.title)
      todos.splice(0, 0, todo)
      await todoListStorage.setItem(`${todo.id}`, todo.toCloneable())
      await updateRemoteTodo(todo)
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
    reTodo,
    sortedTodos,
    finishedTodos,
    finishTodo,
  }
})
