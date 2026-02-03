<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAppLanguage } from '@widget-js/vue3'
import { Locale } from '@nutui/nutui'
import enUS from '@nutui/nutui/dist/packages/locale/lang/en-US'
import { i18n } from '@/i18n'
import { AndroidApi } from '@/api/android/AndroidApi'
import { useSupabaseStore } from '@/stores/useSupabaseStore'

const supabaseStore = useSupabaseStore()
supabaseStore.init()

function updateLang(lang: string) {
  i18n.global.locale = lang
  if (!lang.includes('zh')) {
    Locale.use('en-US', enUS)
  }
}
if (AndroidApi.hasApi()) {
  updateLang(AndroidApi.getLanguage() ?? 'zh')
}
else {
  useAppLanguage({
    onLoad: (lang) => {
      updateLang(lang)
    },
    onChange: (lang) => {
      updateLang(lang)
    },
  })
}
</script>

<template>
  <RouterView v-slot="{ Component }">
    <component :is="Component" />
  </RouterView>
</template>

<style>
html {
  font-size: var(--widget-font-size);
  font-family: var(--widget-font-family);
}
body{
  overflow: hidden;
}
</style>
