import type { DefaultLocaleMessageSchema } from 'vue-i18n'

export const unitMessage: DefaultLocaleMessageSchema = {
  zh: {
    unit: {
      year: '年',
      month: '月',
      week: '周',
      day: '天',
      hour: '时',
      minute: '分',
      second: '秒',
      line: '条',
    },
  },
  en: {
    unit: {
      year: 'year | years',
      month: 'month',
      week: 'week | weeks',
      day: 'day | days',
      hour: 'hour | hours',
      minute: 'minute | minutes',
      second: 'second | seconds',
      line: '-',
    },
  },
}
