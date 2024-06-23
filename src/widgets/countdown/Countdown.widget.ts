import {
  Widget,
  WidgetKeyword,
} from '@widget-js/core'

const name = 'cn.widgetjs.widgets.countdown2'
// 组件标题
const title = { 'zh-CN': '倒计时' }
// 组件描述
const description = { 'zh-CN': '日历样式的倒计时组件' }
// 组件关键词
const keywords = [WidgetKeyword.RECOMMEND]
// 组件路由地址
const url = '/widget/countdown2'
// 组件关键词
const CountdownWidget = new Widget({
  path: url,
  configPagePath: '/?frame=true&transparent=false&width=400&height=700&tab=countdown',
  name,
  title,
  description,
  categories: ['countdown'],
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
