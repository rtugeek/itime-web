import type { RouteRecordRaw } from 'vue-router'
import CountdownWidget from './Countdown.widget'

const url = CountdownWidget.path
const name = CountdownWidget.name

const CountdownWidgetRoutes: RouteRecordRaw[] = [
  {
    path: url,
    name: `${name}`,
    component: () => import(/* webpackChunkName: "com.wisdom.widgets.countdown2" */ './CountdownWidgetView.vue'),
  },
]

export default CountdownWidgetRoutes
