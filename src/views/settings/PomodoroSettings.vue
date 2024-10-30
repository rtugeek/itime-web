<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { type PomodoroSettings, getDefaultPomodoroSettings } from '@/data/PomodoroSettings'
import { AppConfig } from '@/common/AppConfig'

const pomoSettings = useStorage<PomodoroSettings>(AppConfig.KEY_POMODORO_SETTINGS, getDefaultPomodoroSettings())
const { t } = useI18n()
</script>

<template>
  <nut-cell-group>
    <nut-cell :title="t('pomodoro.time', { time: pomoSettings.pomoTime })">
      <template #desc>
        <nut-input-number v-model="pomoSettings.pomoTime" :min="5" :max="60" type="text" />
      </template>
    </nut-cell>
    <nut-cell :title="t('pomodoro.shortBreakTime', { time: pomoSettings.shortBreakTime })">
      <template #desc>
        <nut-input-number v-model="pomoSettings.shortBreakTime" :min="1" :max="30" type="text" />
      </template>
    </nut-cell>
    <nut-cell :title="t('pomodoro.autoStart')">
      <template #title>
        <div style="width: 240px">
          {{ t('pomodoro.autoStart') }}
        </div>
      </template>
      <template #desc>
        <nut-switch v-model="pomoSettings.isAutoNext" />
      </template>
    </nut-cell>
  </nut-cell-group>
</template>

<style scoped lang="scss">

</style>
