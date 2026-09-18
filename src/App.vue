<script setup lang="ts">
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import { useAppLanguage } from '@widget-js/vue3'
import { UserDataSync } from '@/data/sync/UserDataSync'
import { PomodoroHistorySync } from '@/data/sync/PomodoroHistorySync'
import { i18n } from '@/i18n'
import { useUserStore } from '@/stores/useUserStore'
import { useSyncStore } from '@/stores/useSyncStore'

const userStore = useUserStore()
useSyncStore()
void userStore.init()
watch(() => userStore.user?.uuid, (uuid) => {
  if (uuid) {
    void UserDataSync.sync()
    void PomodoroHistorySync.sync()
  }
}, { immediate: true })

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
