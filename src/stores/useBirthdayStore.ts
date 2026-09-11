import { defineStore } from 'pinia'
import { reactive, toRaw } from 'vue'
import { useBirthdayBroadcast } from '@/common/broadcast/useBirthdayBroadcast'
import type { Birthday } from '@/data/Birthday'
import { migrateBirthday } from '@/data/db'
import { BirthdayWrapper } from '@/data/BirthdayWrapper'
import { BirthdayRepository } from '@/data/repository/BirthdayRepository'
import { BirthdaySync } from '@/data/sync/BirthdaySync'

export const useBirthdayStore = defineStore('birthday-store', () => {
  const birthdayList = reactive<Birthday[]>([])
  function upsertBirthday(birthday: Birthday) {
    const index = birthdayList.findIndex(it => it.id == birthday.id)
    if (index > -1) {
      birthdayList[index] = birthday
    }
    else {
      birthdayList.push(birthday)
    }
  }

  const { postEvent } = useBirthdayBroadcast({
    onUpdated: (birthday) => {
      upsertBirthday(birthday)
      sortBirthdayList()
    },
    onInserted: (birthday) => {
      upsertBirthday(birthday)
      sortBirthdayList()
    },
    onDeleted: (birthday) => {
      const index = birthdayList.findIndex(it => it.id == birthday.id)
      if (index > -1) {
        birthdayList.splice(index, 1)
      }
    },
  })

  const find = async (id: string) => {
    return await BirthdayRepository.findOne({ id })
  }

  const load = async () => {
    await migrateBirthday()
    birthdayList.splice(0, birthdayList.length)
    const birthdays = await BirthdayRepository.findAll()
    birthdayList.push(...birthdays)
    sortBirthdayList()
  }

  const sortBirthdayList = () => {
    birthdayList.sort((a, b) => {
      return new BirthdayWrapper(a).countdown() - new BirthdayWrapper(b).countdown()
    })
  }

  async function remove(birthday: Birthday) {
    const index = birthdayList.findIndex(it => it.id == birthday.id)
    if (index > -1) {
      birthdayList.splice(index, 1)
    }
    await BirthdayRepository.remove(birthday)
  }

  async function removeById(id: string) {
    const index = birthdayList.findIndex(it => it.id.toString() == id)
    if (index > -1) {
      birthdayList.splice(index, 1)
    }
    await BirthdayRepository.remove(id)
  }

  async function save(birthday: Birthday, options?: {
    sync: boolean
    sort: boolean
    broadcast: boolean
  }) {
    const sort = options?.sort ?? true
    const broadcast = options?.broadcast ?? true
    const rawBirthday = toRaw(birthday)
    rawBirthday.needSync = true
    const savedBirthday = await BirthdayRepository.save(rawBirthday, true)
    upsertBirthday(savedBirthday)
    if (broadcast) {
      postEvent({ type: 'update', data: savedBirthday })
    }
    if (sort) {
      sortBirthdayList()
    }
    BirthdaySync.sync()
  }

  load()

  BirthdaySync.sync()

  return {
    remove,
    removeById,
    birthdayList,
    find,
    save,
  }
})
