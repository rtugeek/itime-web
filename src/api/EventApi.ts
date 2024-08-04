import { cacheApi } from '@/api/Api'
import type { Almanac } from '@/api/PublicEventApi'

export class EventApi {
  static getCalendar(): Promise<Almanac[]> {
    return cacheApi.get('/event/public/calendar')
  }
}
