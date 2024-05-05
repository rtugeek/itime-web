import { Widget, WidgetKeyword } from '@widget-js/core'

const CalendarWidget = new Widget({
  name: 'itime.fun.calendar',
  title: { 'zh-CN': '日历' },
  description: { 'zh-CN': '简单的日历，支持节假日显示' },
  keywords: [WidgetKeyword.RECOMMEND],
  lang: 'zh-CN',
  width: 4,
  height: 4,
  minWidth: 4,
  maxWidth: 6,
  minHeight: 4,
  maxHeight: 6,
  previewImage: '/images/preview_calendar.png',
  path: '/widget/calendar',
  configPagePath: '/widget/config/calendar',
})

export default CalendarWidget
