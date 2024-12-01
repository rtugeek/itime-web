import type { DefaultLocaleMessageSchema } from 'vue-i18n'

export const countdownMessage: DefaultLocaleMessageSchema = {
  zh: {
    countdown: {
      add: '添加倒计时',
      edit: '编辑倒计时',
      deleteConfirm: '确定要删除 {name}?',
      namePlaceholder: '请输入倒计时名称',
      nameEmptyWarning: '名称不能为空',
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
      days: 'day | day | days',
      add: 'Add Countdown',
      edit: 'Edit Countdown',
      deleteConfirm: 'Are you sure you want to delete {name}?',
      namePlaceholder: 'Countdown Name',
      nameEmptyWarning: 'Name cannot be empty',
      set: 'Set Countdown',
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
