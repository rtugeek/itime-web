import localforage from 'localforage'
import TodoListWidget from '@/widgets/todo-list/TodoList.widget'

const todoListStorage = localforage.createInstance({
  name: `${TodoListWidget.name}`,
  storeName: 'todo-list',
})
const dueStorage = localforage.createInstance({
  name: `${TodoListWidget.name}`,
  storeName: 'due-list',
})
export { todoListStorage, dueStorage }
