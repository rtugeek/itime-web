import { Widget, WidgetKeyword } from '@widget-js/core';
const CalendarWidget = new Widget({
  name: 'com.wisdom.itime.calendar',
  title: { 'zh-CN': '日历' },
  description: { 'zh-CN': '简单的日历，支持节假日显示' },
  keywords: [WidgetKeyword.RECOMMEND],
  lang: 'zh-CN',
  width: 6,
  height: 6,
  minWidth: 4,
  maxWidth: 6,
  minHeight: 4,
  maxHeight: 6,
  previewImage: '修改为组件预览图地址',
  path: '/widget/calendar',
  configPagePath: '/widget/config/calendar',
});

export default CalendarWidget;
