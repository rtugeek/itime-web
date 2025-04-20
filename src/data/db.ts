import localforage from 'localforage'
import consola from 'consola'
import TodoListWidget from '@/widgets/todo-list/TodoList.widget'
import BirthdayListWidget from '@/widgets/birthday-list/BirthdayList.widget'
import { BirthdayRepository } from '@/data/repository/BirthdayRepository'
import type { Birthday } from '@/data/Birthday'
import type { Todo } from '@/data/Todo'
import { TodoRepository } from '@/data/repository/TodoRepository'

/**
 * @deprecated
 */
const todoListStorage = localforage.createInstance({
  name: `${TodoListWidget.name}`,
  storeName: 'todo-list-v1',
})
/**
 * @deprecated
 */
const completeStorage = localforage.createInstance({
  name: `${TodoListWidget.name}`,
  storeName: 'complete-list-v1',
})

/**
 * @deprecated
 */
const birthdayStorage = localforage.createInstance({
  name: `${BirthdayListWidget.name}`,
  storeName: 'birthday-list-v1',
})

async function migrateBirthday() {
  const keys = await birthdayStorage.keys()

  for (const key of keys) {
    const birthday = await birthdayStorage.getItem<Birthday>(key)
    if (birthday) {
      consola.info(`Migrate birthday: ${key}`, birthday)
      // 添加到 BirthdayRepository
      await BirthdayRepository.save(birthday, true)
      // 删除旧的存储
      await birthdayStorage.removeItem(key)
    }
  }
}

/**
 * 迁移旧数据到新的 Dexie 数据库
 */
const migrateTodo = async () => {
  const MIGRATION_KEY = 'todo_repository_migrated'

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
        await TodoRepository.add({
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
        await TodoRepository.add({
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

export { todoListStorage, completeStorage, birthdayStorage, migrateTodo, migrateBirthday }
