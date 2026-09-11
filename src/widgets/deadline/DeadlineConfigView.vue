<script lang="ts" setup>
import { useWidget, useWidgetTheme } from '@widget-js/vue3'
import { useStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { computed } from 'vue'
import { DefaultWidgetTheme } from '@widget-js/core'
import { useI18n } from 'vue-i18n'
import { AppConfig } from '@/common/AppConfig'
import type { DeadlineConfig } from '@/widgets/deadline/DeadlineConfig'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'

const { widgetParams } = useWidget()
const { t } = useI18n()
const now = dayjs()
const deadlineConfig = useStorage<DeadlineConfig>(`${AppConfig.KEY_DEADLINE_CONFIG}-${widgetParams.id}`, {
  title: 'Deadline',
  startTime: now.toDate(),
  endTime: now.add(7, 'days').toDate(),
})
const minEndDate = computed(() => {
  return dayjs().add(1, 'day').toDate()
})

const { widgetTheme } = useWidgetTheme({ defaultTheme: DefaultWidgetTheme.copy({
  useGlobalTheme: false,
  primaryColor: '#BE002A',
}) })

const borderRadius = computed({
  get: () => {
    if (typeof widgetTheme!.value.borderRadius == 'number') {
      return widgetTheme!.value.borderRadius
    }
    if (!widgetTheme!.value.borderRadius) {
      return 0
    }
    return Number.parseInt(widgetTheme!.value.borderRadius!.replace('px', ''))
  },
  set: (value) => {
    widgetTheme.value.borderRadius = `${value}px`
  },
})

const borderRadiusValue = computed({
  get: () => [borderRadius.value],
  set: (val: number[]) => {
    borderRadius.value = val[0] ?? 0
  },
})
</script>

<template>
  <BaseView :title="t('deadlineSetting.title')">
    <div class="p-2 flex flex-col gap-4">
      <Card>
        <CardContent class="pt-6 flex flex-col gap-4">
          <h4 class="font-medium">
            {{ t('deadlineSetting.title') }}
          </h4>
          <div class="flex flex-col gap-2">
            <Label for="deadline-title">{{ t('deadlineSetting.form.title') }}</Label>
            <Input id="deadline-title" v-model="deadlineConfig.title" />
          </div>
          <div class="flex flex-col gap-2">
            <Label>{{ t('deadlineSetting.form.startDate') }}</Label>
            <DateInput v-model="deadlineConfig.startTime" :lunar="false" />
          </div>
          <div class="flex flex-col gap-2">
            <Label>{{ t('deadlineSetting.form.endDate') }}</Label>
            <DateInput v-model="deadlineConfig.endTime" :min-date="minEndDate" :lunar="false" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6 flex flex-col gap-4">
          <h4 class="font-medium">
            {{ t('themeSetting.title') }}
          </h4>
          <div class="flex items-center justify-between">
            <Label for="use-global-theme">{{ t('themeSetting.useGlobalTheme') }}</Label>
            <Switch id="use-global-theme" v-model="widgetTheme.useGlobalTheme" />
          </div>
          <div v-show="!widgetTheme.useGlobalTheme" class="flex flex-col gap-2">
            <Label>{{ t('themeSetting.primaryColor') }}</Label>
            <NutColorPicker v-model="widgetTheme.primaryColor" />
          </div>
          <div v-show="!widgetTheme.useGlobalTheme" class="flex flex-col gap-2">
            <Label>{{ t('themeSetting.backgroundColor') }}</Label>
            <NutColorPicker v-model="widgetTheme.backgroundColor" />
          </div>
          <div v-show="!widgetTheme.useGlobalTheme" class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <Label>{{ t('themeSetting.borderRadius') }}</Label>
              <span class="text-sm text-muted-foreground">{{ borderRadius }}px</span>
            </div>
            <Slider v-model="borderRadiusValue" :min="0" :max="50" />
          </div>
        </CardContent>
      </Card>
    </div>
  </BaseView>
</template>

<style scoped></style>
