import { defineStore } from 'pinia'
import { ref, toRaw, watch } from 'vue'
import { useEventListener, useIntervalFn } from '@vueuse/core'
import { useUserStore } from '@/stores/useUserStore'
import { useBirthdayBroadcast } from '@/common/broadcast/useBirthdayBroadcast'
import type { IBirthday } from '@/data/Birthday'
import { Birthday } from '@/data/Birthday'
import { BirthdayRepository } from '@/data/repository/BirthdayRepository'
import { UserDataSync } from '@/data/sync/UserDataSync'

export const useBirthdayStore = defineStore('birthday-store', () => {
  const userStore = useUserStore()
  const visible = (item: IBirthday) => !item.deleteTime && (!item.userId || Number(item.userId) === userStore.userId)
  const birthdayList = ref<IBirthday[]>([])
  let loadPromise: Promise<void> | undefined

  const { postEvent } = useBirthdayBroadcast({
    onSynced: () => { void load() },
    onUpdated: (birthday) => {
      if (!visible(birthday)) { return }
      const list = [...birthdayList.value]
      const idx = list.findIndex(it => String(it.id) === String(birthday.id))
      if (idx > -1) {
        list[idx] = birthday
      }
      else {
        list.push(birthday)
      }
      sortBirthdayListInPlace(list)
      birthdayList.value = list
    },
    onInserted: (birthday) => {
      if (!visible(birthday)) { return }
      const list = [...birthdayList.value]
      if (!list.some(it => String(it.id) === String(birthday.id))) {
        list.push(birthday)
        sortBirthdayListInPlace(list)
        birthdayList.value = list
      }
    },
    onDeleted: (birthday) => {
      const list = birthdayList.value.filter(it => String(it.id) !== String(birthday.id))
      birthdayList.value = list
    },
  })

  const find = async (id: string) => {
    const item = await BirthdayRepository.findOne({ id })
    return item && visible(item) ? item : undefined
  }

  const load = async () => {
    if (loadPromise) { return loadPromise }
    loadPromise = (async () => {
      try {
        const list = (await BirthdayRepository.findAll()).filter(visible)
        sortBirthdayListInPlace(list)
        birthdayList.value = list
      }
      finally {
        loadPromise = undefined
      }
    })()
    return loadPromise
  }

  const sortBirthdayListInPlace = (list: IBirthday[]) => {
    list.sort((a, b) => {
      const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      if (orderDiff !== 0) { return orderDiff }
      return new Birthday(a).countdown() - new Birthday(b).countdown()
    })
  }

  async function saveAll(birthdays: IBirthday[]) {
    for (let i = 0; i < birthdays.length; i++) {
      birthdays[i].sortOrder = i
    }
    const saved = await BirthdayRepository.saveAll(birthdays.map(toRaw), false)
    sortBirthdayListInPlace(saved)
    birthdayList.value = saved
    postEvent({ type: 'save-all', time: Date.now() })
    void UserDataSync.sync()
    return saved
  }

  async function remove(birthday: IBirthday) {
    const removed = await BirthdayRepository.softRemove(String(birthday.id))
    await load()
    postEvent({ type: 'delete', data: removed })
    void UserDataSync.sync()
  }

  async function removeById(id: string) {
    const item = await BirthdayRepository.findOne({ id })
    if (item) { await remove(item) }
  }

  async function save(birthday: IBirthday, options?: {
    sync: boolean
    sort: boolean
    broadcast: boolean
  }) {
    const sort = options?.sort ?? true
    const broadcast = options?.broadcast ?? true
    const rawBirthday = toRaw(birthday)
    rawBirthday.needSync = true
    const savedBirthday = await BirthdayRepository.save(rawBirthday, true)
    const list = [...birthdayList.value]
    const idx = list.findIndex(it => String(it.id) === String(savedBirthday.id))
    if (idx > -1) {
      list[idx] = savedBirthday
    }
    else if (visible(savedBirthday)) {
      list.push(savedBirthday)
    }
    if (sort) {
      sortBirthdayListInPlace(list)
    }
    birthdayList.value = list
    if (broadcast) {
      postEvent({ type: 'update', data: savedBirthday })
    }
    if (options?.sync !== false) { void UserDataSync.sync() }
  }

  watch(UserDataSync.revision, () => {
    void load()
    postEvent({ type: 'sync' })
  })
  watch(() => userStore.userId, () => {
    birthdayList.value = []
    void load()
  }, { flush: 'sync' })
  useIntervalFn(() => { void UserDataSync.sync() }, 5 * 60 * 1000)
  useEventListener(window, 'online', () => { void UserDataSync.sync() })
  void load().then(() => { void UserDataSync.sync() })

  return {
    sync: () => UserDataSync.sync(),
    syncing: UserDataSync.busy,
    syncError: UserDataSync.error,
    remove,
    removeById,
    birthdayList,
    find,
    save,
    saveAll,
  }
})
