import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@nutui/touch-emulator'
import { ConfigProvider, Toast } from '@nutui/nutui'
import { WidgetJsPlugin } from '@widget-js/vue3'

import '@nutui/nutui/dist/style.css'
import '@widget-js/vue3/dist/style.css'
import 'virtual:uno.css'
import './assets/main.css'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import isoWeek from 'dayjs/plugin/isoWeek'
import duration from 'dayjs/plugin/duration'
import Vue3ColorPicker from 'vue3-colorpicker'
import router from './router'
import App from './App.vue'
import 'vue3-colorpicker/style.css'

dayjs.extend(isoWeek)
dayjs.extend(isToday)
dayjs.extend(duration)

const app = createApp(App)

app.use(createPinia())
app.use(Toast)
app.use(router)
app.use(Vue3ColorPicker)
app.use(WidgetJsPlugin)
app.use(ConfigProvider)
app.mount('#app')
