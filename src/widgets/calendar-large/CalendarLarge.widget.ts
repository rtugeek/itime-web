import { Widget, WidgetKeyword } from '@widget-js/core'

const CalendarLargeWidget = new Widget({
  name: 'itime.fun.calendar_large',
  title: { 'zh-CN': '大号日历' },
  description: { 'zh-CN': '大尺寸日历，方便用户对整月日程进行安排' },
  keywords: [WidgetKeyword.RECOMMEND],
  categories: ['calendar'],
  lang: 'zh-CN',
  width: 8,
  height: 8,
  minWidth: 8,
  maxWidth: 12,
  minHeight: 8,
  maxHeight: 12,
  previewImage: '/images/preview_calendar_large.png',
  path: '/widget/calendar_large',
  configPagePath:
    '/widget/config/calendar_large?width=600&height=500&frame=true&transparent=false',
})

export default CalendarLargeWidget
