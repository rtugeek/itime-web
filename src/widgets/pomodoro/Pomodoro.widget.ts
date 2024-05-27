import { Widget, WidgetKeyword } from '@widget-js/core'

const PomodoroWidget = new Widget({
  name: 'itime.fun.pomodoro',
  title: { 'zh-CN': '番茄钟' },
  description: { 'zh-CN': '' },
  keywords: [WidgetKeyword.RECOMMEND],
  lang: 'zh-CN',
  width: 2,
  height: 2,
  minWidth: 2,
  maxWidth: 4,
  minHeight: 2,
  maxHeight: 4,
  previewImage: '修改为组件预览图地址',
  path: '/widget/pomodoro',
  configPagePath: '/widget/config/pomodoro',
})

export default PomodoroWidget
