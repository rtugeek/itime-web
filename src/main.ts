import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@nutui/touch-emulator'
import { ConfigProvider } from '@nutui/nutui'
import { WidgetJsPlugin } from '@widget-js/vue3'

import '@nutui/nutui/dist/style.css'
import '@widget-js/vue3/dist/style.css'
import 'virtual:uno.css'
import './assets/main.css'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import isoWeek from 'dayjs/plugin/isoWeek'
import duration from 'dayjs/plugin/duration'
import router from './router'
import App from './App.vue'

dayjs.extend(isoWeek)
dayjs.extend(isToday)
dayjs.extend(duration)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(WidgetJsPlugin)
app.use(ConfigProvider)
app.mount('#app')
