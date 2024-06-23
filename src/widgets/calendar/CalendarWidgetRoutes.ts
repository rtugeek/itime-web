import type { RouteRecordRaw } from 'vue-router'
import CalendarWidget from './Calendar.widget'

const path = CalendarWidget.path
const name = CalendarWidget.name

const configPagePath = CalendarWidget.configPagePath!.split('?')[0]

const CalendarWidgetRoutes: RouteRecordRaw[] = [
  {
    path,
    name: `${name}`,
    component: () =>
      import(
        /* webpackChunkName: "com.wisdom.itime.calendar" */ './CalendarWidgetView.vue'
      ),
  },
  {
    path: configPagePath,
    name: `${name}.config`,
    component: () =>
      import(
        /* webpackChunkName: "com.wisdom.itime.calendar.config" */ './CalendarConfigView.vue'
      ),
  },
]

export default CalendarWidgetRoutes
