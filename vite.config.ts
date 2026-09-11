import { URL, fileURLToPath } from 'node:url'
import widget from '@widget-js/vite-plugin-widget'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import consola from 'consola'
// https://vitejs.dev/config/
export default defineConfig((config: UserConfig) => {
  let mode = config.mode
  let base = '/web'
  if (mode == 'offline') {
    mode = 'production'
    base = './'
  }
  consola.info(`config:`, config)
  return {
    mode,
    base,
    plugins: [
      vue(),
      widget({ generateZip: config.mode == 'offline' }),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
