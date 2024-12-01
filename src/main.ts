import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@nutui/touch-emulator'
import { ConfigProvider, Notify, Toast } from '@nutui/nutui'
import { WidgetJsPlugin } from '@widget-js/vue3'

import '@nutui/nutui/dist/style.css'
import '@widget-js/vue3/dist/style.css'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import isoWeek from 'dayjs/plugin/isoWeek'
import duration from 'dayjs/plugin/duration'
import Vue3ColorPicker from 'vue3-colorpicker'
import router from './router'
import App from './App.vue'
import 'vue3-colorpicker/style.css'
import 'virtual:uno.css'
import { i18n } from '@/i18n'
import { hideInAndroid, showInAndroid } from '@/common/directive/android-show'
import './assets/main.css'

dayjs.extend(isoWeek)
dayjs.extend(isToday)
dayjs.extend(duration)

const app = createApp(App)
app.directive('android', showInAndroid)
  .directive('no-android', hideInAndroid)
app.use(createPinia())
  .use(Toast).use(Notify).use(i18n).use(router).use(Vue3ColorPicker).use(WidgetJsPlugin).use(ConfigProvider).mount('#app')
