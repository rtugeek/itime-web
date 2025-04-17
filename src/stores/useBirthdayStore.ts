import { defineStore } from 'pinia'
import { reactive, toRaw, watch } from 'vue'
import consola from 'consola'
import { useBroadcastChannel } from '@vueuse/core'
import { AppConfig } from '@/common/AppConfig'
import type { Birthday } from '@/data/Birthday'
import { migrateBirthday } from '@/data/db'
import { BirthdayWrapper } from '@/data/BirthdayWrapper'
import { BirthdayRepository } from '@/data/repository/BirthdayRepository'
import { BirthdaySync } from '@/data/sync/BirthdaySync'

interface BirthdayEvent {
  type: 'insert' | 'update' | 'delete'
  data: Birthday
}

export const useBirthdayStore = defineStore('birthday-store', () => {
  const birthdayList = reactive<Birthday[]>([])
  const broadcastChannel = useBroadcastChannel({
    name: AppConfig.CHANNEL_BIRTHDAY,
  })
  watch(broadcastChannel.data, () => {
    consola.info('broadcastChannel.data', broadcastChannel.data.value)
    const payload = broadcastChannel.data.value as (BirthdayEvent | undefined)
    if (payload) {
      const birthday = payload.data
      if (payload.type == 'update') {
        const findIndex = birthdayList.findIndex(it => it.id == birthday.id)
        if (findIndex > -1) {
          birthdayList[findIndex] = birthday
          sortBirthdayList()
        }
        else {
          birthdayList.splice(0, 0, birthday)
          sortBirthdayList()
        }
      }
      else if (payload.type == 'delete') {
        birthdayList.splice(birthdayList.findIndex(it => it.id == birthday.id), 1)
      }
    }
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
    await BirthdayRepository.save(rawBirthday, true)
    if (broadcast) {
      broadcastChannel.post({ type: 'update', data: rawBirthday })
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
