import type { EventInput, EventSourceInput } from '@fullcalendar/core'

import dayjs from 'dayjs'
import { Lunar } from 'lunar-typescript'

export function useLunarEventSource(): EventSourceInput {
  return {
    events: (fetchInfo, successCallback, failureCallback) => {
      const start = dayjs(fetchInfo.start)
      const end = dayjs(fetchInfo.end).add(1, 'day')
      let current = start
      const events: EventInput[] = []
      while (current.isBefore(end)) {
        const lunar = Lunar.fromDate(current.toDate())
        const arr = lunar.toString().split('年')
        const title = arr[1]
        const event: EventInput = {
          id: `lunar_${current.valueOf()}`,
          title,
          allDay: true,
          start: current.toDate(),
        }
        events.push(event)
        current = current.add(1, 'day')
      }
      successCallback(events)
    },
    id: 'lunar',
    color: '#29b4ff',
    textColor: '#fff',
  }
}
