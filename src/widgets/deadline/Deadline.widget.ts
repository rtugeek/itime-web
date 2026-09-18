import { Widget, WidgetKeyword } from '@widget-js/core'

const DeadlineWidget = new Widget({
  name: '.deadline',
  title: { 'zh-CN': 'Deadline', 'en-US': 'Deadline' },
  description: { 'zh-CN': '最后期限进度条', 'en-US': 'Deadline countdown progress bar' },
  keywords: [WidgetKeyword.RECOMMEND],
  categories: ['fun', 'countdown', 'time'],
  lang: 'zh-CN',
  width: 4,
  height: 2,
  minWidth: 4,
  maxWidth: 4,
  minHeight: 2,
  maxHeight: 2,
  previewImage: '/images/preview_deadline.png',
  path: '/widget/deadline',
  configPagePath: '/widget/config/deadline?frame=true&transparent=false&width=900&height=700',
  configPage: {
    path: '/widget/config/deadline',
    frame: true,
    transparent: false,
    width: 900,
    height: 700,
  },
})

export default DeadlineWidget
