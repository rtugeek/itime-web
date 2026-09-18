import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { WidgetJsPlugin } from '@widget-js/vue3'

import '@widget-js/vue3/dist/style.css'
import 'vue-sonner/style.css'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import isoWeek from 'dayjs/plugin/isoWeek'
import duration from 'dayjs/plugin/duration'
import router from './router'
import App from './App.vue'
import { i18n } from '@/i18n'
import './assets/main.css'

dayjs.extend(isoWeek)
dayjs.extend(isToday)
dayjs.extend(duration)

const app = createApp(App)
app.use(createPinia())
  .use(i18n).use(router).use(WidgetJsPlugin).mount('#app')
