import { api } from '@/api/Api'

export class PublicEventApi {
  static getCalendar(): Promise<HuangLi[]> {
    return api.get('/event/public/calendar')
  }
}

export interface HuangLi {
  id: number
  year: number
  month: number
  dayOfMonth: number
  suit: string
  avoid: string
  festival: string
  lunarYear: number
  lunarMonth: number
  lunarDayOfMonth: number
  lMonth: string
  lDayOfMonth: string
  gzDate: string
  gzMonth: string
  gzYear: string
  animal: string
  term: string
  /**
   * 空-正常日期，1-放假，2-补班
   */
  status?: number
  cnDayOfWeek: string
  type: string
}
