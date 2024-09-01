import { defineStore } from 'pinia'
import { reactive, toRaw, watch } from 'vue'
import consola from 'consola'
import { useBroadcastChannel } from '@vueuse/core'
import { AppConfig } from '@/common/AppConfig'
import type { Birthday } from '@/data/Birthday'
import { birthdayStorage } from '@/data/db'
import { BirthdayWrapper } from '@/data/BirthdayWrapper'

interface BirthdayEvent {
  type: 'insert' | 'update' | 'delete'
  birthday: Birthday
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
    const birthday = await birthdayStorage.getItem<Birthday>(id)
    if (birthday) {
      return birthday
    }
    return undefined
  }

  const load = async () => {
    birthdayList.splice(0, birthdayList.length)
    const keys = await birthdayStorage.keys()
    for (const key of keys) {
      const birthday = await birthdayStorage.getItem<Birthday>(key)
      if (birthday) {
        birthdayList.push(birthday)
      }
    }
    sortBirthdayList()
  }

  const sortBirthdayList = () => {
    birthdayList.sort((a, b) => {
      return new BirthdayWrapper(a).countdown() - new BirthdayWrapper(b).countdown()
    })
  }

  function remove(birthday: Birthday) {
    const index = birthdayList.findIndex(it => it.id == birthday.id)
    if (index > -1) {
      birthdayList.splice(index, 1)
    }
    birthdayStorage.removeItem(`${birthday.id}`)
  }

  function removeById(id: string) {
    const index = birthdayList.findIndex(it => it.id == id)
    if (index > -1) {
      birthdayList.splice(index, 1)
    }
    birthdayStorage.removeItem(id)
  }

  async function save(birthday: Birthday, options?: {
    sync: boolean
    sort: boolean
    broadcast: boolean
  }) {
    // const sync = options?.sync ?? true
    const sort = options?.sort ?? true
    const broadcast = options?.broadcast ?? true
    const rawBirthday = toRaw(birthday)
    await birthdayStorage.setItem(`${rawBirthday.id}`, rawBirthday)
    birthdayList.splice(0, 0, rawBirthday)
    if (broadcast) {
      broadcastChannel.post({ type: 'update', data: rawBirthday })
    }
    // if (sync) {
    // }
    if (sort) {
      sortBirthdayList()
    }
  }

  load()

  return {
    remove,
    removeById,
    birthdayList,
    find,
    save,
  }
})
