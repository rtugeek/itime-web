import type { DefaultLocaleMessageSchema } from 'vue-i18n'

export const pomodoroMessage: DefaultLocaleMessageSchema = {
  zh: {
    pomodoro: {
      resting: '休息中',
      emptyTip: '请到设置页面添加专注场景',
      settings: '番茄钟设置',
      time: '番茄时长（{time}m）',
      shortBreakTime: '休息时长（{time}m）',
      autoStart: '自动开始下个番茄钟',
      title: '番茄钟',
      scene: {
        edit: '编辑场景',
        add: '添加场景',
        placeholder: '请输入场景名称',
      },
      error: {
        name: '名称不能为空',
      },
      iconAndName: '图标与名称',
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
      scene: {
        edit: 'Edit Scene',
        add: 'Add Scene',
        placeholder: 'Enter scene name',
      },
      error: {
        name: 'Name is required',
      },
      iconAndName: 'Icon and Name',
    },
  },
}
