import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@nutui/touch-emulator'
import { ConfigProvider } from '@nutui/nutui'
import App from './App.vue'
import router from './router'

import '@nutui/nutui/dist/style.css'
import './assets/main.css'
import 'virtual:uno.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ConfigProvider)

app.mount('#app')
