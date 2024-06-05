import { BackgroundWidget, WidgetKeyword } from '@widget-js/core'

const PomodoroWidget = new BackgroundWidget({
  name: 'itime.fun.pomodoro',
  title: { 'zh-CN': '番茄钟' },
  description: { 'zh-CN': '高效管理时间，提高专注力' },
  keywords: [WidgetKeyword.RECOMMEND],
  lang: 'zh-CN',
  previewImage: '/images/preview_pomodoro.png',
  categories: ['productivity'],
  path: '/widget/pomodoro',
  requiredAppVersion: '24.6.2',
  configPagePath: '/widget/config/pomodoro',
  browserWindowOptions: {
    transparent: false,
    frame: false,
    backgroundMaterial: 'acrylic',
    backgroundThrottling: false,
  },
})

export default PomodoroWidget
