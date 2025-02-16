import type { RouteRecordRaw } from 'vue-router'
import CountdownListWidget from '@/widgets/countdown-list/CountdownList.widget'

const CountdownListWidgetRoutes: RouteRecordRaw[] = [
  {
    path: CountdownListWidget.path,
    name: `${CountdownListWidget.name}`,
    component: () => import('./CountdownListWidgetView.vue'),
  },
  {
    path: CountdownListWidget.configPagePath!.split('?')[0],
    name: `${CountdownListWidget.name}.config`,
    component: () =>
      import('./CountdownListConfigView.vue'),
  },
]

export default CountdownListWidgetRoutes
