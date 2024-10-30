import type { DefaultDateTimeFormatSchema } from 'vue-i18n'

export const pomodoroMessage: DefaultDateTimeFormatSchema = {
  zh: {
    pomodoro: {
      resting: '休息中',
      emptyTip: '请到设置页面添加专注场景',
      settings: '番茄钟设置',
      time: '番茄时长（{time}m）',
      shortBreakTime: '休息时长（{time}m）',
      autoStart: '自动开始下个番茄钟',
      title: '番茄钟',
    },
  },
  en: {
    pomodoro: {
      title: 'Pomodoro',
      resting: 'Resting',
      emptyTip: 'Please add a focus scene first',
      settings: 'Pomodoro',
      time: 'Time ({time}m)',
      shortBreakTime: 'Short Break ({time}m)',
      autoStart: 'Start Pomodoro once break ends',
    },
  },
}
