<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { type PomodoroSettings, getDefaultPomodoroSettings } from '@/data/PomodoroSettings'
import { AppConfig } from '@/common/AppConfig'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'

const pomoSettings = useStorage<PomodoroSettings>(AppConfig.KEY_POMODORO_SETTINGS, getDefaultPomodoroSettings())
const { t } = useI18n()
</script>

<template>
  <Card class="gap-0 py-0 shadow-sm">
    <CardContent class="px-4 sm:px-6">
      <Field orientation="horizontal" class="settings-row">
        <FieldLabel for="pomo-time" class="text-sm font-medium">
          {{ t('pomodoro.time', { time: pomoSettings.pomoTime }) }}
        </FieldLabel>
        <FieldContent class="flex-none items-end">
          <NumberField
            v-model="pomoSettings.pomoTime"
            :min="5"
            :max="60"
            :step="1"
            class="w-32"
          >
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput id="pomo-time" />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </FieldContent>
      </Field>
      <Separator />
      <Field orientation="horizontal" class="settings-row">
        <FieldLabel for="short-break-time" class="text-sm font-medium">
          {{ t('pomodoro.shortBreakTime', { time: pomoSettings.shortBreakTime }) }}
        </FieldLabel>
        <FieldContent class="flex-none items-end">
          <NumberField
            v-model="pomoSettings.shortBreakTime"
            :min="1"
            :max="30"
            :step="1"
            class="w-32"
          >
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput id="short-break-time" />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </FieldContent>
      </Field>
      <Separator />
      <Field orientation="horizontal" class="settings-row">
        <FieldLabel for="auto-start" class="text-sm font-medium">
          {{ t('pomodoro.autoStart') }}
        </FieldLabel>
        <FieldContent class="flex-none items-end">
          <Switch id="auto-start" v-model="pomoSettings.isAutoNext" />
        </FieldContent>
      </Field>
    </CardContent>
  </Card>
</template>

<style scoped>
.settings-row {
  box-sizing: border-box;
  min-height: 5rem;
  padding-block: 1rem;
  align-items: center;
  gap: 1rem;
}
</style>
