import { Widget, WidgetKeyword } from '@widget-js/core'

const BirthdayListWidget = new Widget({
  name: '.birthday_list',
  title: { 'zh-CN': '时间列表', 'en-US': 'Time List' },
  description: { 'zh-CN': '自动排序倒计时的时间列表', 'en-US': 'Time list with countdown' },
  keywords: [WidgetKeyword.RECOMMEND],
  lang: 'zh-CN',
  width: 4,
  previewImage: '/images/preview_birthday_list.png',
  height: 4,
  minWidth: 3,
  maxWidth: 6,
  minHeight: 3,
  categories: ['time', 'countdown'],
  maxHeight: 6,
  path: '/widget/birthday_list',
  configPagePath: '/widget/config/birthday_list?frame=true&transparent=false&width=600&height=400',
})

export default BirthdayListWidget
