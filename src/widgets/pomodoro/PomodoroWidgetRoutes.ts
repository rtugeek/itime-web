import type { RouteRecordRaw } from 'vue-router'
import PomodoroWidget from './Pomodoro.widget'

const path = PomodoroWidget.path
const name = PomodoroWidget.name

const configPagePath = PomodoroWidget.configPagePath!.split('?')[0]

const PomodoroWidgetRoutes: RouteRecordRaw[] = [
  {
    path,
    name: `${name}`,
    component: () =>
      import(
        /* webpackChunkName: "itime.fun.pomodoro" */ './PomodoroWidgetView.vue'
      ),
  },
  {
    path: configPagePath,
    name: `${name}.config`,
    component: () =>
      import(
        /* webpackChunkName: "itime.fun.pomodoro.config" */ './PomodoroConfigView.vue'
      ),
  },
]

export default PomodoroWidgetRoutes
