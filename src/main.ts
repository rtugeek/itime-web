import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { WidgetJsPlugin } from '@widget-js/vue3'

import '@widget-js/vue3/dist/style.css'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import isoWeek from 'dayjs/plugin/isoWeek'
import duration from 'dayjs/plugin/duration'
import Vue3ColorPicker from 'vue3-colorpicker'
import router from './router'
import App from './App.vue'
import 'vue3-colorpicker/style.css'
import { i18n } from '@/i18n'
import './assets/main.css'

dayjs.extend(isoWeek)
dayjs.extend(isToday)
dayjs.extend(duration)

const app = createApp(App)
app.use(createPinia())
  .use(i18n).use(router).use(Vue3ColorPicker).use(WidgetJsPlugin).mount('#app')
