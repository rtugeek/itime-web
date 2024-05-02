import { URL, fileURLToPath } from 'node:url'
import widget from '@widget-js/vite-plugin-widget'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'
import NutUIResolver from '@nutui/auto-import-resolver'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/itime',
  plugins: [
    vue(),
    widget(),
    Components({
      resolvers: [NutUIResolver()],
    }),
    UnoCSS(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
