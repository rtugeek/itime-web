import localforage from 'localforage'
import consola from 'consola'
import TodoListWidget from '@/widgets/todo-list/TodoList.widget'
import BirthdayListWidget from '@/widgets/birthday-list/BirthdayList.widget'
import { BirthdayRepository } from '@/data/repository/BirthdayRepository'
import type { Birthday } from '@/data/Birthday'

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

export { completeStorage, birthdayStorage, migrateBirthday }
