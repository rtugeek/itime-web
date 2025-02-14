import {
  Widget,
  WidgetKeyword,
} from '@widget-js/core'

const name = 'itime.fun.countdown'
const keywords = [WidgetKeyword.RECOMMEND]
// 组件关键词
const CountdownWidget = new Widget({
  path: '/widget/countdown',
  configPagePath: '/?frame=true&transparent=false&width=400&height=700&tab=countdown',
  name,
  title: { 'zh-CN': '倒计时', 'en-US': 'Countdown' },
  description: { 'zh-CN': '日历样式的倒计时组件', 'en-US': 'Countdown widget with calendar style' },
  categories: ['time','countdown'],
  keywords,
  previewImage: '/images/preview_countdown.png',
  lang: 'zh-CN',
  width: 2,
  height: 2,
  minWidth: 2,
  maxWidth: 4,
  minHeight: 2,
  maxHeight: 4,
})

export default CountdownWidget
