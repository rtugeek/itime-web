import { api } from '@/api/Api'

export class ICalendarApi {
  static async post(): Promise<string> {
    return (await api.post(`/icalendar`)) as string
  }

  static get(): Promise<string> {
    return api.get('/icalendar')
  }
}
