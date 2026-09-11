<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PomodoroSettings from '@/views/settings/PomodoroSettings.vue'

const { t } = useI18n()
</script>

<template>
  <section class="flex w-full max-w-3xl flex-col gap-4">
    <h2 class="text-xl font-semibold tracking-tight text-foreground">
      {{ t('pomodoro.settings') }}
    </h2>
    <PomodoroSettings />
  </section>
</template>
