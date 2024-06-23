import type { RouteRecordRaw } from 'vue-router'
import PomodoroWidget from './Pomodoro.widget'

const path = PomodoroWidget.path
const name = PomodoroWidget.name

const PomodoroWidgetRoutes: RouteRecordRaw[] = [
  {
    path,
    name: `${name}`,
    component: () =>
      import(
        /* webpackChunkName: "itime.fun.pomodoro" */ './PomodoroWidgetView.vue'
      ),
  },
]

export default PomodoroWidgetRoutes
