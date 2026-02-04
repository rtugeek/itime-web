<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PomodoroSettings from '@/views/settings/PomodoroSettings.vue'

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col">
    <h4> {{ t('pomodoro.settings') }}</h4>
    <PomodoroSettings />
  </div>
</template>

<style scoped lang="scss">

</style>
