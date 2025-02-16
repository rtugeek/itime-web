import { Widget, WidgetKeyword } from '@widget-js/core'

const CountdownListWidget = new Widget({
  name: '.countdown_list',
  title: { 'zh-CN': '倒计时列表', 'en-US': 'Countdown List' },
  description: { 'zh-CN': '自动排序的倒计时列表', 'en-US': 'Automatically sorted countdown list' },
  keywords: [WidgetKeyword.RECOMMEND],
  lang: 'zh-CN',
  width: 4,
  previewImage: '/images/preview_countdown_list.png',
  height: 4,
  minWidth: 3,
  maxWidth: 6,
  minHeight: 3,
  categories: ['time', 'countdown'],
  maxHeight: 6,
  path: '/widget/countdown/list',
  configPagePath: '/widget/config/countdown/list?frame=true&transparent=false&width=600&height=400',
})

export default CountdownListWidget
