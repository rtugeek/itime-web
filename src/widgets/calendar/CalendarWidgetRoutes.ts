import type { RouteRecordRaw } from 'vue-router';
import CalendarWidget from './Calendar.widget';

const path = CalendarWidget.path;
const name = CalendarWidget.name;

const configPagePath = CalendarWidget.configPagePath!;

const CalendarWidgetRoutes: RouteRecordRaw[] = [
  {
    path: path,
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
];

export default CalendarWidgetRoutes;
