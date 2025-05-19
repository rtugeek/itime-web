import type { EventInput, EventSourceInput } from '@fullcalendar/core'

import { delay } from '@widget-js/core'
import { PublicEventApi } from '@/api/PublicEventApi'

export function useFestivalEventSource(): EventSourceInput {
  return {
    events: (fetchInfo, successCallback, failureCallback) => {
      const festivals: EventInput[] = []
      PublicEventApi.getCalendar().then(async (huangLiList) => {
        await delay(500)
        for (const it of huangLiList) {
          if (it.festival || it.term) {
            const arr: string[] = []
            if (it.festival) {
              arr.push(it.term)
            }
            if (it.term) {
              if (!arr.includes(it.term)) {
                arr.push(it.term)
              }
            }
            const festivalStr = arr.join(' ')
            const date = new Date(it.year, it.month - 1, it.dayOfMonth)
            for (const festival of festivalStr.split(' ').filter(it => it)) {
              const event: EventInput = {
                id: `huangli_${date}`,
                title: festival,
                allDay: true,
                start: date,
              }
              festivals.push(event)
            }
          }
        }
        successCallback(festivals)
      })
    },
    color: '#ff9029',
    textColor: '#fff',
  }
}
