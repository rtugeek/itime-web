<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAppLanguage } from '@widget-js/vue3'
import { i18n } from '@/i18n'
import { useSupabaseStore } from '@/stores/useSupabaseStore'

const supabaseStore = useSupabaseStore()
supabaseStore.init()

function updateLang(lang: string) {
  i18n.global.locale = lang.includes('zh') ? 'zh' : 'en'
}
useAppLanguage({
  onLoad: (lang) => {
    updateLang(lang)
  },
  onChange: (lang) => {
    updateLang(lang)
  },
})
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
