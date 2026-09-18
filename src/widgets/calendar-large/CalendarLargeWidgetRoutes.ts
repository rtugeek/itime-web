import type { RouteRecordRaw } from 'vue-router'
import CalendarLargeWidget from './CalendarLarge.widget'

const path = CalendarLargeWidget.path
const name = CalendarLargeWidget.name

const CalendarLargeWidgetRoutes: RouteRecordRaw[] = [
  {
    path,
    name: `${name}`,
    component: () => import('./CalendarLargeWidgetView.vue'),
  },
]

export default CalendarLargeWidgetRoutes
