import type { RouteRecordRaw } from 'vue-router'
import CountdownListWidget from '@/widgets/countdown-list/CountdownList.widget'

const CountdownListWidgetRoutes: RouteRecordRaw[] = [
  {
    path: CountdownListWidget.path,
    name: `${CountdownListWidget.name}`,
    component: () => import('./CountdownListWidgetView.vue'),
  },
]

export default CountdownListWidgetRoutes
