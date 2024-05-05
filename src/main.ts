import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@nutui/touch-emulator'
import { ConfigProvider } from '@nutui/nutui'
import { WidgetJsPlugin } from '@widget-js/vue3'
import App from './App.vue'
import router from './router'

import '@nutui/nutui/dist/style.css'
import './assets/main.css'
import '@widget-js/vue3/dist/style.css'
import 'virtual:uno.css'
import dayjs from "dayjs";
import isToday from 'dayjs/plugin/isToday'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(isoWeek)
dayjs.extend(isToday)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(WidgetJsPlugin)
app.use(ConfigProvider)

app.mount('#app')
