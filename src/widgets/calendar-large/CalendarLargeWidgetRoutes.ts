import type { RouteRecordRaw } from 'vue-router';
import CalendarLargeWidget from './CalendarLarge.widget';

const path = CalendarLargeWidget.path;
const name = CalendarLargeWidget.name;

const configPagePath = CalendarLargeWidget.configPagePath!.split('?')[0];

const CalendarLargeWidgetRoutes: RouteRecordRaw[] = [
  {
    path: path,
    name: `${name}`,
    component: () => import('./CalendarLargeWidgetView.vue'),
  },
  {
    path: configPagePath,
    name: `${name}.config`,
    component: () => import('./CalendarLargeConfigView.vue'),
  },
];

export default CalendarLargeWidgetRoutes;
