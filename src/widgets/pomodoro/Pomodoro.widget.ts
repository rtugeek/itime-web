import { BackgroundWidget, WidgetKeyword } from '@widget-js/core'

const PomodoroWidget = new BackgroundWidget({
  name: 'itime.fun.pomodoro',
  title: { 'zh-CN': '番茄钟', 'en-US': 'Pomodoro Timer' },
  description: { 'zh-CN': '高效管理时间，提高专注力', 'en-US': ' Help you focus on any tasks' },
  keywords: [WidgetKeyword.RECOMMEND],
  lang: 'zh-CN',
  previewImage: '/images/preview_pomodoro.png',
  categories: ['productivity'],
  path: '/widget/pomodoro',
  requiredAppVersion: '24.6.2',
  configPagePath: '/settings?frame=true&transparent=false&width=400&height=700',
  browserWindowOptions: {
    transparent: false,
    frame: false,
    backgroundMaterial: 'acrylic',
    backgroundThrottling: false,
  },
})

export default PomodoroWidget
