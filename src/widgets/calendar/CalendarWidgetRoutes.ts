import type { RouteRecordRaw } from 'vue-router'
import CalendarWidget from './Calendar.widget'

const path = CalendarWidget.path
const name = CalendarWidget.name

const CalendarWidgetRoutes: RouteRecordRaw[] = [
  {
    path,
    name: `${name}`,
    component: () =>
      import(
        /* webpackChunkName: "com.wisdom.itime.calendar" */ './CalendarWidgetView.vue'
      ),
  },
]

export default CalendarWidgetRoutes
