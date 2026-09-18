import type { RouteRecordRaw } from 'vue-router'
import BirthdayListWidget from '@/widgets/birthday-list/BirthdayList.widget'

const BirthdayListWidgetRoutes: RouteRecordRaw[] = [
  {
    path: BirthdayListWidget.path,
    name: `${BirthdayListWidget.name}`,
    component: () => import('./BirthdayListWidgetView.vue'),
  },
]

export default BirthdayListWidgetRoutes
