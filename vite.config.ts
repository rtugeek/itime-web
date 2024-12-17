import { URL, fileURLToPath } from 'node:url'
import widget from '@widget-js/vite-plugin-widget'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'
import NutUIResolver from '@nutui/auto-import-resolver'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import legacy from '@vitejs/plugin-legacy'
import consola from 'consola'
// https://vitejs.dev/config/
export default defineConfig((config: UserConfig) => {
  let mode = config.mode
  let base = '/web'
  if (mode == 'android') {
    mode = 'production'
    base = '/assets'
  }
  else if (mode == 'ios') {
    mode = 'production'
    base = '/'
  }
  consola.info(`config:`, config)
  return {
    mode,
    base,
    plugins: [
      vue(),
      widget(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [NutUIResolver(), ElementPlusResolver()],
      }),
      UnoCSS(),
      legacy({
        targets: ['ChromeAndroid > 73', ' Chrome > 73'],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
