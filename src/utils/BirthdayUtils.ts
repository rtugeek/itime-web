import dayjs from 'dayjs'
import type { Birthday } from '@/data/Birthday'

export class BirthdayUtils {
  static new(title: string = ''): Birthday {
    const now = dayjs().subtract(10, 'years').toDate()
    const nowStr = now.toISOString()
    return {
      createTime: nowStr,
      dateType: 0,
      name: title,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      dayOfMonth: now.getDate(),
      updateTime: nowStr,
      id: now.getTime(),
      introduction: '',
      single_event: false,
    }
  }
}
