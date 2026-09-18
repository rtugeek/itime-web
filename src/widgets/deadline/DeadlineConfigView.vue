<script lang="ts" setup>
import { useWidget } from '@widget-js/vue3'
import { useStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { computed } from 'vue'
import { BrowserWindowApi, DefaultWidgetTheme } from '@widget-js/core'
import { useI18n } from 'vue-i18n'
import { Check } from '@lucide/vue'
import { AppConfig } from '@/common/AppConfig'
import type { DeadlineConfig } from '@/widgets/deadline/DeadlineConfig'
import DateInput from '@/components/DateInput.vue'
import ThemeColorPicker from '@/components/ThemeColorPicker.vue'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

const { t } = useI18n()
const { widgetParams } = useWidget()
const now = dayjs()
const deadlineConfig = useStorage<DeadlineConfig>(`${AppConfig.KEY_DEADLINE_CONFIG}-${widgetParams.id}`, {
  title: 'Deadline',
  startTime: now.toDate(),
  endTime: now.add(7, 'days').toDate(),
})
const minEndDate = computed(() => {
  return dayjs().add(1, 'day').toDate()
})

const { widgetTheme } = useWidget({ defaultTheme: DefaultWidgetTheme.copy({
  useGlobalTheme: false,
  primaryColor: '#BE002A',
}), immediate: false })

const colorFields = [
  { key: 'primaryColor', label: '主色调' },
  { key: 'backgroundColor', label: '背景颜色' },
] as const

const borderRadius = computed({
  get: () => [Number.parseFloat(String(widgetTheme.value.borderRadius ?? 0)) || 0],
  set: (value: number[]) => {
    widgetTheme.value.borderRadius = `${value[0] ?? 0}px`
  },
})
</script>

<template>
  <div class="deadline-config mx-auto flex w-full max-w-2xl flex-col gap-4 py-2">
    <Card class="gap-5 rounded-xl py-5 shadow-none">
      <CardHeader class="gap-1 px-5">
        <CardTitle class="text-base font-semibold">
          常规设置
        </CardTitle>
      </CardHeader>
      <CardContent class="grid gap-5 px-5">
        <div class="grid gap-2">
          <Label for="deadline-title">{{ t('deadlineSetting.form.title') }}</Label>
          <Input id="deadline-title" v-model="deadlineConfig.title" />
        </div>
        <div class="grid gap-2">
          <Label>{{ t('deadlineSetting.form.startDate') }}</Label>
          <DateInput v-model="deadlineConfig.startTime" :lunar="false" />
        </div>
        <div class="grid gap-2">
          <Label>{{ t('deadlineSetting.form.endDate') }}</Label>
          <DateInput v-model="deadlineConfig.endTime" :min-date="minEndDate" :lunar="false" />
        </div>
      </CardContent>
    </Card>
    <Card class="gap-5 rounded-xl py-5 shadow-none">
      <CardHeader class="gap-1 px-5">
        <CardTitle class="text-base font-semibold">
          外观设置
        </CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col gap-5 px-5">
        <div class="flex items-center justify-between gap-4">
          <div class="grid gap-1.5">
            <Label for="deadline-global-theme">{{ t('themeSetting.useGlobalTheme') }}</Label>
            <p class="text-xs text-muted-foreground">
              跟随桌面组件的统一外观
            </p>
          </div>
          <Switch id="deadline-global-theme" v-model="widgetTheme.useGlobalTheme" />
        </div>
        <template v-if="!widgetTheme.useGlobalTheme">
          <Separator />
          <div v-for="field in colorFields" :key="field.key" class="config-row">
            <Label :for="`deadline-${field.key}`">{{ field.label }}</Label>
            <ThemeColorPicker :id="`deadline-${field.key}`" v-model="widgetTheme[field.key]" :label="field.label" />
          </div>
          <Separator />
          <div class="grid gap-4 pb-1">
            <div class="flex items-center justify-between">
              <Label for="deadline-border-radius">{{ t('themeSetting.borderRadius') }}</Label>
              <span class="rounded-md bg-muted px-2 py-1 text-xs tabular-nums text-muted-foreground">{{ borderRadius[0] }} px</span>
            </div>
            <Slider id="deadline-border-radius" v-model="borderRadius" :min="0" :max="50" :step="1" aria-label="圆角" />
          </div>
        </template>
      </CardContent>
    </Card>
    <div class="flex items-center justify-between gap-4 px-1 pt-1">
      <p class="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Check class="size-3.5" />
        修改自动保存并生效
      </p>
      <Button class="min-w-20" @click="BrowserWindowApi.close()">
        完成
      </Button>
    </div>
  </div>
</template>

<style scoped>
.deadline-config {
  font-family: Inter, "Segoe UI", "Microsoft YaHei", sans-serif;
}
.config-row {
  display: grid;
  grid-template-columns: minmax(100px, 1fr) minmax(0, 280px);
  align-items: center;
  gap: 16px;
}
@media (max-width: 539px) {
  .config-row { grid-template-columns: minmax(0, 1fr); gap: 8px; }
}
</style>
