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
import { migrateLegacyData } from '@/utils/LegacyMigration'

dayjs.extend(isoWeek)
dayjs.extend(isToday)
dayjs.extend(duration)

async function bootstrap() {
  try {
    await migrateLegacyData()
  }
  catch (error) {
    console.error('旧版本数据迁移失败，下次启动时重试', error)
    const root = document.querySelector('#app')
    if (root) {
      root.textContent = `旧数据迁移未完成，已暂停启动与同步，旧数据和番茄钟历史已保留。请处理错误后刷新重试：${error instanceof Error ? error.message : String(error)}`
    }
    return
  }
  const app = createApp(App)
  app.use(createPinia())
    .use(i18n).use(router).use(WidgetJsPlugin).mount('#app')
}

void bootstrap()
