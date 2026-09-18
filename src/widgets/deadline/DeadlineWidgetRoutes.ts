import type { RouteRecordRaw } from 'vue-router'
import DeadlineWidget from './Deadline.widget'

const path = DeadlineWidget.path
const name = DeadlineWidget.name

const DeadlineWidgetRoutes: RouteRecordRaw[] = [
  {
    path,
    name: `${name}`,
    component: () =>
      import(
        /* webpackChunkName: "itime.fun.deadline" */ './DeadlineWidgetView.vue'
      ),
  },
]

export default DeadlineWidgetRoutes
