import { ref, toRaw, watch } from 'vue'
import { defineStore } from 'pinia'
import { useDebounceFn, useEventListener, useIntervalFn } from '@vueuse/core'
import { useWidgetStorage } from '@widget-js/vue3'
import consola from 'consola'
import { CountdownEventRepository } from '@/data/repository/CountdownEventRepository'
import { CountdownEvent } from '@/data/CountdownEvent'
import { useUserStore } from '@/stores/useUserStore'
import { UserDataSync } from '@/data/sync/UserDataSync'
import { useCountdownBroadcast } from '@/common/broadcast/useCountdownBroadcast'

export type ListSort = 'asc' | 'desc'
export const useCountdownEventStore = defineStore('countdownEventStore', () => {
  const events = ref<CountdownEvent[]>([])
  const userStore = useUserStore()
  const sort = useWidgetStorage<ListSort>('countdownEventSort', 'asc')
  const loading = ref(false)
  const loadError = ref('')
  const hiddenByAccountCount = ref(0)
  let loadRevision = 0

  async function reload() {
    const revision = ++loadRevision
    const account = userStore.userId
    const isCurrent = () => revision === loadRevision && account === userStore.userId
    loading.value = true
    loadError.value = ''
    try {
      const rows = await CountdownEventRepository.all()
      if (!isCurrent()) { return }
      const visible = rows.filter(item => !item.userId || Number(item.userId) === account)
      hiddenByAccountCount.value = rows.length - visible.length
      const newEvents = visible.map(it => CountdownEvent.fromObject(it))
      // 先展示已读取的数据，单条重复规则或写入错误不应阻止整批展示。
      events.value = newEvents
      let failed = 0
      for (let index = 0; index < newEvents.length; index++) {
        if (!isCurrent()) { return }
        const event = newEvents[index]
        try {
          if (event.getRecurrence() && event.isPast()) {
            const dateTime = event.getNextSolarDate().toISOString()
            if (event.dateTime === dateTime) { continue }
            const updated = CountdownEvent.fromObject({ ...event, dateTime })
            const saved = await CountdownEventRepository.save(updated)
            if (!isCurrent()) { return }
            newEvents[index] = saved
          }
        }
        catch (error) {
          failed++
          consola.error('Countdown recurrence update failed', event.id, error)
        }
      }
      if (!isCurrent()) { return }
      // 排序优先级：sortOrder 第一，日期第二。
      const dateValue = (event: CountdownEvent) => new Date(event.dateTime).getTime()
      newEvents.sort((a, b) => {
        const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        if (orderDiff !== 0) { return orderDiff }
        const left = dateValue(a)
        const right = dateValue(b)
        if (!Number.isFinite(left)) { return Number.isFinite(right) ? 1 : 0 }
        if (!Number.isFinite(right)) { return -1 }
        return sort.value === 'asc' ? left - right : right - left
      })
      events.value = [...newEvents]
      if (failed) { loadError.value = `${failed} 条倒计时的重复日期更新失败，已保留原数据。` }
    }
    catch (error) {
      if (!isCurrent()) { return }
      loadError.value = `倒计时加载失败：${error instanceof Error ? error.message : String(error)}`
      consola.error('Countdown load failed', error)
    }
    finally {
      if (revision === loadRevision) { loading.value = false }
    }
  }
  const { postEvent } = useCountdownBroadcast({
    onChanged: useDebounceFn(reload, 1000),
  })

  async function deleteCountdown(id: string) {
    await CountdownEventRepository.softRemove(id)
    await reload()
    postEvent({ type: 'delete', id })
    UserDataSync.sync()
  }

  function toggleSort() {
    sort.value = sort.value === 'asc' ? 'desc' : 'asc'
    reload()
  }

  const saveAll = async (eventsToSave: CountdownEvent[]) => {
    for (let i = 0; i < eventsToSave.length; i++) {
      eventsToSave[i].sortOrder = i
    }
    const saved = await CountdownEventRepository.saveAll(eventsToSave.map(toRaw), true)
    events.value = saved
    postEvent({ type: 'save-all', time: Date.now() })
    UserDataSync.sync()
    return saved
  }

  const save = async (event: CountdownEvent) => {
    event.needSync = true
    const saved = await CountdownEventRepository.save(toRaw(event))
    await reload()
    postEvent({ type: 'save', event: saved, time: Date.now() })
    UserDataSync.sync()
  }
  watch(UserDataSync.revision, () => {
    void reload()
    postEvent({ type: 'sync' })
  })
  watch(() => userStore.userId, () => {
    events.value = []
    void reload()
  }, { flush: 'sync' })
  useIntervalFn(() => { void UserDataSync.sync() }, 5 * 60 * 1000)
  useEventListener(window, 'online', () => { void UserDataSync.sync() })
  void CountdownEventRepository.createDefaultCountdown().catch((error) => {
    consola.error('Countdown initialization failed', error)
  }).then(async () => {
    await reload()
    void UserDataSync.sync()
  })
  return {
    sync: () => UserDataSync.sync(),
    syncing: UserDataSync.busy,
    syncError: UserDataSync.error,
    events,
    loading,
    loadError,
    hiddenByAccountCount,
    toggleSort,
    reload,
    deleteCountdown,
    save,
    saveAll,
  }
})
