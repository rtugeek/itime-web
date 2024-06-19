<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { getDefaultPomodoroSettings, type PomodoroSettings } from '@/data/PomodoroSettings'
import { AppConfig } from '@/common/AppConfig'

const pomoSettings = useStorage<PomodoroSettings>(AppConfig.KEY_POMODORO_SETTINGS, getDefaultPomodoroSettings())
</script>

<template>
  <nut-form>
    <nut-form-item label-width="130px" :label="`番茄时长（${pomoSettings.pomoTime}m）`">
      <nut-input-number v-model="pomoSettings.pomoTime" :min="5" :max="60" type="text" />
    </nut-form-item>
    <nut-form-item label-width="130px" :label="`休息时长（${pomoSettings.shortBreakTime}m）`">
      <nut-input-number v-model="pomoSettings.shortBreakTime" :min="1" :max="30" type="text" />
    </nut-form-item>
    <nut-form-item label-width="130px" label="自动开始下个番茄钟">
      <nut-switch v-model="pomoSettings.isAutoNext" />
    </nut-form-item>
  </nut-form>
</template>

<style scoped lang="scss">

</style>
