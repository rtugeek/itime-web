import localforage from 'localforage'
import TodoListWidget from '@/widgets/todo-list/TodoList.widget'
import BirthdayListWidget from '@/widgets/birthday-list/BirthdayList.widget'

const todoListStorage = localforage.createInstance({
  name: `${TodoListWidget.name}`,
  storeName: 'todo-list-v1',
})
const completeStorage = localforage.createInstance({
  name: `${TodoListWidget.name}`,
  storeName: 'complete-list-v1',
})

const birthdayStorage = localforage.createInstance({
  name: `${BirthdayListWidget.name}`,
  storeName: 'birthday-list-v1',
})
export { todoListStorage, completeStorage, birthdayStorage }
