import type { DefaultLocaleMessageSchema } from 'vue-i18n'

export const countdownMessage: DefaultLocaleMessageSchema = {
  zh: {
    countdown: {
      title: '倒计时',
      add: '添加倒计时',
      edit: '编辑倒计时',
      list: '倒计时列表',
      deleteConfirm: '确定要删除 {name}?',
      namePlaceholder: '请输入倒计时名称',
      nameEmptyWarning: '名称不能为空',
      note: '备注',
      formatUnit: {
        title: '时间格式',
        year: '年',
        month: '月',
        week: '周',
        day: '天',
        hour: '时',
        minute: '分',
        second: '秒',
        millisecond: '毫秒',
      },
      set: '设置倒计时',
      days: '天',
      deadline: {
        remain: '剩余 {0}',
      },
    },
    deadlineSetting: {
      title: 'Deadline设置',
      form: {
        title: '标题',
        startDate: '开始日期',
        endDate: '最后期限',
      },
    },
    themeSetting: {
      title: '主题设置',
      useGlobalTheme: '使用全局主题',
      primaryColor: '主色调',
      backgroundColor: '背景颜色',
      borderRadius: '背景圆角',
    },
  },
  en: {
    countdown: {
      title: 'Countdown',
      days: 'day | day | days',
      add: 'Add Countdown',
      edit: 'Edit Countdown',
      note: 'Note',
      deleteConfirm: 'Are you sure you want to delete {name}?',
      namePlaceholder: 'Countdown Name',
      nameEmptyWarning: 'Name cannot be empty',
      set: 'Set Countdown',
      list: 'Countdown List',
      formatUnit: {
        title: 'Time Unit',
        year: 'Year',
        month: 'Month',
        week: 'Week',
        day: 'Day',
        hour: 'Hour',
        minute: 'Minute',
        second: 'Second',
        millisecond: 'Millisecond',
      },
      deadline: {
        remain: 'in {0}',
      },
    },
    deadlineSetting: {
      title: 'Deadline',
      form: {
        title: 'Title',
        startDate: 'Start Date',
        endDate: 'End Date',
      },
    },
    themeSetting: {
      title: 'Theme Settings',
      useGlobalTheme: 'Use Global Theme',
      primaryColor: 'Primary Color',
      backgroundColor: 'BG Color',
      borderRadius: 'BG Border Radius',
    },
  },
}
