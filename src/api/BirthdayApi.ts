import { api } from '@/api/Api'
import type { Birthday } from '@/data/Birthday'
import type { PageResult } from '@/api/ApiResult'

export class BirthdayApi {
  static async getBirthdays(page: number = 1, size: number = 200): Promise<PageResult<Birthday>> {
    return (await api.get(`/birthday?page=${page}&size=${size}`)) as PageResult<Birthday>
  }

  static save(birthday: Birthday): Promise<Birthday> {
    return api.post('/birthday', birthday)
  }

  static delete(id: number): Promise<void> {
    return api.delete(`/birthday/${id}`)
  }
}
