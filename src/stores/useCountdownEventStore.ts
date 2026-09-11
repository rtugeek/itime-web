import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { useWidgetStorage } from '@widget-js/vue3'
import consola from 'consola'
import { CountdownEventRepository } from '@/data/repository/CountdownEventRepository'
import { CountdownEvent } from '@/data/CountdownEvent'
import { CountdownSync } from '@/data/sync/CountdownSync'
import { useCountdownBroadcast } from '@/common/broadcast/useCountdownBroadcast'

export type ListSort = 'asc' | 'desc'
export const useCountdownEventStore = defineStore('countdownEventStore', () => {
  const events = ref<CountdownEvent[]>([])
  const sort = useWidgetStorage<ListSort>('countdownEventSort', 'asc')
  async function reload() {
    const newEvents = (await CountdownEventRepository.all()).map(it => CountdownEvent.fromObject(it))
    newEvents.sort((a, b) => {
      if (sort.value === 'asc') {
        return a.countdown() - b.countdown()
      }
      else {
        return b.countdown() - a.countdown()
      }
    })
    for (const newEvent of newEvents) {
      if (newEvent.getRecurrence() && newEvent.isPast()) {
        const nextSolarDate = newEvent.getNextSolarDate()
        consola.log('recurrence:', newEvent.name, nextSolarDate.toISOString())
        newEvent.dateTime = nextSolarDate.toISOString()
        await CountdownEventRepository.save(newEvent)
      }
    }
    events.value = newEvents
  }

  CountdownEventRepository.createDefaultCountdown()

  const { postEvent } = useCountdownBroadcast({
    onChanged: useDebounceFn(reload, 1000),
  })

  async function deleteCountdown(id: string) {
    await CountdownEventRepository.softRemove(id)
    await reload()
    postEvent({ type: 'delete', id })
    CountdownSync.sync()
  }

  function toggleSort() {
    sort.value = sort.value === 'asc' ? 'desc' : 'asc'
    reload()
  }

  const save = async (event: CountdownEvent) => {
    event.needSync = true
    await CountdownEventRepository.save(event)
    await reload()
    postEvent({ type: 'save', event, time: Date.now() })
    CountdownSync.sync()
  }
  reload()
  return {
    events,
    toggleSort,
    reload,
    deleteCountdown,
    save,
  }
})
