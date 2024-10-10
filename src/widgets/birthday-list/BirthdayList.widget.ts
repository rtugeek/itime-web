import { Widget, WidgetKeyword } from '@widget-js/core'

const BirthdayListWidget = new Widget({
  name: '.birthday_list',
  title: { 'zh-CN': '生日列表', 'en-US': 'Birthday List' },
  description: { 'zh-CN': '自动倒计时的生日列表', 'en-US': 'Birthday list with countdown' },
  keywords: [WidgetKeyword.RECOMMEND],
  lang: 'zh-CN',
  width: 4,
  previewImage: '/images/preview_birthday_list.png',
  height: 4,
  minWidth: 3,
  maxWidth: 4,
  minHeight: 3,
  categories: ['countdown'],
  maxHeight: 6,
  path: '/widget/birthday_list',
  configPagePath: '/widget/config/birthday_list?frame=true&transparent=false&width=600&height=400',
})

export default BirthdayListWidget
