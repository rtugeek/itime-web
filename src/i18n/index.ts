import { createI18n } from 'vue-i18n'
import { todoMessage } from '@/i18n/todo'
import { pomodoroMessage } from '@/i18n/pomodoro'
import { countdownMessage } from '@/i18n/countdown'
import { birthdayMessage } from '@/i18n/birthdayMessage'
import { userMessage } from '@/i18n/userMessage'

export const i18n = createI18n({
  locale: 'en',
  datetimeFormats: {
    en: {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      yearMonth: { year: 'numeric', month: 'short' },
      long: { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short', hour: 'numeric', minute: 'numeric' },
    },
    zh: {
      yearMonth: { year: 'numeric', month: 'short' },
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short', hour: 'numeric', minute: 'numeric' },
    },
  },
  messages: {
    zh: {
      countdown: '倒计时',
      settings: '设置',
      appSettings: '应用设置',
      save: '保存',
      minute: '分钟',
      saving: '保存中',
      recurrence: {
        title: '重复设置',
        none: '不重复',
        daily: '每天',
        weekly: '每周',
        monthly: '每月',
      },
      week: {
        number: '第{week}周',
        short: { sunday: '日', monday: '一', tuesday: '二', wednesday: '三', thursday: '四', friday: '五', saturday: '六' },
      },
      ...todoMessage.zh,
      ...pomodoroMessage.zh,
      ...countdownMessage.zh,
      ...birthdayMessage.zh,
      ...userMessage.zh,
    },
    en: {
      countdown: 'Countdown',
      settings: 'Settings',
      appSettings: 'App Settings',
      save: 'Save',
      saving: 'Saving',
      minute: 'min',
      recurrence: {
        title: 'Recurrence',
        none: 'None',
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
      },
      week: {
        number: 'Week {week}',
        short: { sunday: 'Sun', monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat' },
      },
      ...pomodoroMessage.en,
      ...todoMessage.en,
      ...countdownMessage.en,
      ...birthdayMessage.en,
      ...userMessage.en,
    },
  },
})
