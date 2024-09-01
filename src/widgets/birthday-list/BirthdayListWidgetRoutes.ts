import type { RouteRecordRaw } from 'vue-router'
import BirthdayListWidget from '@/widgets/birthday-list/BirthdayList.widget'

const BirthdayListWidgetRoutes: RouteRecordRaw[] = [
  {
    path: BirthdayListWidget.path,
    name: `${BirthdayListWidget.name}`,
    component: () => import(/* webpackChunkName: "cn.widgetjs.widgets.birthday_list" */ './BirthdayListWidgetView.vue'),
  },
  {
    path: BirthdayListWidget.configPagePath!.split('?')[0],
    name: `${BirthdayListWidget.name}.config`,
    component: () =>
      import(/* webpackChunkName: "cn.widgetjs.widgets.birthday_list.config" */ './BirthdayListConfigView.vue'),
  },
]

export default BirthdayListWidgetRoutes
