import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useBroadcastChannel } from '@vueuse/core'
import { CountdownEventRepository } from '@/data/repository/CountdownEventRepository'
import { CountdownEvent } from '@/data/CountdownEvent'
import { delay } from '@/utils/TimeUtils'

export const useCountdownEventStore = defineStore('countdownEventStore', () => {
  const events = ref<CountdownEvent[]>([])

  async function reload() {
    const countdownEvents = (await CountdownEventRepository.all()).map(it => CountdownEvent.fromObject(it))
    events.value = countdownEvents
  }

  CountdownEventRepository.createDefaultCountdown()

  const { post, data } = useBroadcastChannel({ name: 'countdownEventStore' })
  watch(data, async () => {
    await delay(1000)
    console.log('asdf')
    reload()
  })

  async function deleteCountdown(id: string) {
    await CountdownEventRepository.remove(id)
    await reload()
    post({ type: 'delete', id })
  }

  const save = async (event: CountdownEvent) => {
    await CountdownEventRepository.save(event)
    await reload()
    post({ type: 'save', event, time: Date.now() })
  }
  reload()
  return {
    events,
    reload,
    deleteCountdown,
    save,
  }
})
