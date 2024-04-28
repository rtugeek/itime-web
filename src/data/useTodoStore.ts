import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
import { dueStorage, todoListStorage } from '@/data/db'
import type { TodoUpdate } from '@/data/Todo'
import { Todo } from '@/data/Todo'

export const useTodoStore = defineStore('todo-store', () => {
  const todos = reactive<Todo[]>([])
  const finishedTodos = reactive<Todo[]>([])

  const sortedTodos = computed(() => {
    return todos.sort((a, b) => a.order - b.order)
  })

  const loadTodo = async () => {
    const keys = await dueStorage.keys()
    for (const key of keys) {
      const todo = await dueStorage.getItem<string>(key)
      if (todo) {
        finishedTodos.push(Todo.fromJSON(JSON.parse(todo)))
      }
    }

    const todoListKeys = await todoListStorage.keys()
    for (const key of todoListKeys) {
      const todo = await todoListStorage.getItem<string>(key)
      if (todo) {
        todos.push(Todo.fromJSON(JSON.parse(todo)))
      }
    }

    todos.sort((a, b) => a.order - b.order)
  }

  loadTodo()

  function deleteTodo(todo: Todo) {
    todos.splice(todos.indexOf(todo), 1)
    todoListStorage.removeItem(`${todo.id}`)
  }

  function finishTodo(todo: Todo) {
    todos.splice(todos.indexOf(todo), 1)
    todo.completedDateTime = new Date()
    finishedTodos.splice(0, 0, todo)
    dueStorage.setItem(`${todo.id}`, JSON.stringify(todo))
    todoListStorage.removeItem(`${todo.id}`)
  }

  function reTodo(todo: Todo) {
    todo.completedDateTime = undefined
    todo.order = 0
    finishedTodos.splice(finishedTodos.indexOf(todo), 1)
    todos.splice(0, 0, todo)
    const id = todo.id
    dueStorage.removeItem(`${id}`)
    todoListStorage.setItem(`${id}`, JSON.stringify(todo))
  }

  function saveTodo(data: TodoUpdate) {
    if (data.todoId) {
      const findIndex = todos.findIndex(it => it.id == data.todoId)
      if (findIndex > -1) {
        const editTodo = todos[findIndex]
        editTodo.title = data.title
        todoListStorage.setItem(`${editTodo.id}`, JSON.stringify(editTodo))
      }
    }
    else {
      const todo = new Todo(data.title)
      todos.splice(0, 0, todo)
      todoListStorage.setItem(`${todo.id}`, JSON.stringify(todo))
    }
  }

  const save = () => {
    for (const todo of todos) {
      todoListStorage.setItem(`${todo.id}`, JSON.stringify(todo))
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
