import type { RouteRecordRaw } from 'vue-router'
import DeadlineWidget from './Deadline.widget'

const path = DeadlineWidget.path
const name = DeadlineWidget.name

const configPagePath = DeadlineWidget.configPagePath!.split('?')[0]

const DeadlineWidgetRoutes: RouteRecordRaw[] = [
  {
    path,
    name: `${name}`,
    component: () =>
      import(
        /* webpackChunkName: "itime.fun.deadline" */ './DeadlineWidgetView.vue'
      ),
  },
  {
    path: configPagePath,
    name: `${name}.config`,
    component: () =>
      import(
        /* webpackChunkName: "itime.fun.deadline.config" */ './DeadlineConfigView.vue'
      ),
  },
]

export default DeadlineWidgetRoutes
