import { createI18n } from 'vue-i18n'
import { todoMessage } from '@/i18n/todoMessage'
import { pomodoroMessage } from '@/i18n/pomodoroMessage'
import { countdownMessage } from '@/i18n/countdownMessage'
import { birthdayMessage } from '@/i18n/birthdayMessage'
import { userMessage } from '@/i18n/userMessage'
import { unitMessage } from '@/i18n/unitMessage'

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
      settings: '设置',
      appSettings: '应用设置',
      save: '保存',
      minute: '分钟',
      saving: '保存中',
      deleting: '删除中',
      widgets: '小组件',
      copy: '复制',
      copied: '已复制',
      view: '查看',
      confirm: '确定',
      delete: '删除',
      recurrence: {
        title: '重复设置',
        none: '不重复',
        daily: '每天',
        weekly: '每周',
        monthly: '每月',
      },
      app: {
        download: '下载APP',
      },
      week: {
        number: '第{week}周',
        short: { sunday: '日', monday: '一', tuesday: '二', wednesday: '三', thursday: '四', friday: '五', saturday: '六' },
      },
      debug: {
        title: '设备信息',
      },
      ics: {
        title: '日历订阅',
        desc: '日历订阅功能是指将iTime中的事件订阅到其他日历应用中（如谷歌日历、苹果日历、微软日历等），或者将其他日历订阅到iTime中。',
        importFromLink: '从链接导入',
        exportToLink: '导出到链接',
        subscribeSuccess: '订阅成功',
        importPlaceholder: '输入ics链接',
      },
      ...todoMessage.zh,
      ...pomodoroMessage.zh,
      ...countdownMessage.zh,
      ...birthdayMessage.zh,
      ...userMessage.zh,
      ...unitMessage.zh,
    },
    en: {
      widgets: 'Widgets',
      view: 'View',
      settings: 'Settings',
      appSettings: 'App Settings',
      copied: 'Copied',
      save: 'Save',
      confirm: 'OK',
      deleting: 'Deleting',
      saving: 'Saving',
      minute: 'min',
      copy: 'Copy',
      delete: 'Delete',
      app: {
        download: 'Download App',
      },
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
      debug: {
        title: 'Debug Info',
      },
      ics: {
        title: 'Calendar Link',
        desc: 'Calendar Link is a feature that allows you to subscribe events from iTime to other calendar apps (e.g. Google Calendar, Apple Calendar, Microsoft Calendar, etc.), or subscribe events from other calendars to iTime.',
        importFromLink: 'Subscribe from Link',
        exportToLink: 'Export to Link',
        subscribeSuccess: 'Subscribe Success',
        importPlaceholder: 'Enter ics link',
      },
      ...pomodoroMessage.en,
      ...todoMessage.en,
      ...countdownMessage.en,
      ...birthdayMessage.en,
      ...userMessage.en,
      ...unitMessage.en,
    },
  },
})
