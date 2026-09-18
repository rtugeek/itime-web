<script lang="ts" setup>
import { computed } from 'vue'
import { useWidget } from '@widget-js/vue3'
import { useStorage } from '@vueuse/core'
import { BrowserWindowApi, DefaultWidgetTheme } from '@widget-js/core'
import { Check } from '@lucide/vue'
import { AppConfig } from '@/common/AppConfig'
import ThemeColorPicker from '@/components/ThemeColorPicker.vue'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const { widgetParams } = useWidget()

interface CalendarConfig {
  firstDayOfWeek: 0 | 1
}

const calendarConfig = useStorage<CalendarConfig>(`${AppConfig.KEY_CALENDAR_CONFIG}-${widgetParams.id}`, {
  firstDayOfWeek: 1,
})

const firstDayOfWeek = computed({
  get: () => String(calendarConfig.value.firstDayOfWeek),
  set: (val: string) => {
    calendarConfig.value.firstDayOfWeek = Number(val) as 0 | 1
  },
})

const { widgetTheme } = useWidget({ defaultTheme: DefaultWidgetTheme.copy(), immediate: false })

const colorFields = [
  { key: 'backgroundColor', label: '背景颜色' },
  { key: 'color', label: '文字颜色' },
  { key: 'primaryColor', label: '主色调' },
] as const

const borderRadius = computed({
  get: () => [Number.parseFloat(String(widgetTheme.value.borderRadius ?? 0)) || 0],
  set: (value: number[]) => {
    widgetTheme.value.borderRadius = `${value[0] ?? 0}px`
  },
})

const fontSize = computed({
  get: () => [Number.parseFloat(String(widgetTheme.value.fontSize ?? 14)) || 14],
  set: (value: number[]) => {
    ;(widgetTheme.value as any).fontSize = value[0] ?? 14
  },
})
</script>

<template>
  <div class="calendar-config mx-auto flex w-full max-w-2xl flex-col gap-4 py-2">
    <Card class="gap-5 rounded-xl py-5 shadow-none">
      <CardHeader class="gap-1 px-5">
        <CardTitle class="text-base font-semibold">
          常规设置
        </CardTitle>
      </CardHeader>
      <CardContent class="grid gap-5 px-5">
        <div class="grid gap-2">
          <Label>一周开始日</Label>
          <RadioGroup v-model="firstDayOfWeek" orientation="horizontal" class="flex items-center gap-6">
            <label class="flex cursor-pointer items-center gap-2 text-sm">
              <RadioGroupItem value="0" />
              周日
            </label>
            <label class="flex cursor-pointer items-center gap-2 text-sm">
              <RadioGroupItem value="1" />
              周一
            </label>
          </RadioGroup>
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
            <Label for="calendar-global-theme">使用全局主题</Label>
            <p class="text-xs text-muted-foreground">
              跟随桌面组件的统一外观
            </p>
          </div>
          <Switch id="calendar-global-theme" v-model="widgetTheme.useGlobalTheme" />
        </div>
        <template v-if="!widgetTheme.useGlobalTheme">
          <Separator />
          <div v-for="field in colorFields" :key="field.key" class="config-row">
            <Label :for="`calendar-${field.key}`">{{ field.label }}</Label>
            <ThemeColorPicker :id="`calendar-${field.key}`" v-model="widgetTheme[field.key]" :label="field.label" />
          </div>
          <Separator />
          <div class="grid gap-4 pb-1">
            <div class="flex items-center justify-between">
              <Label for="calendar-font-size">字号</Label>
              <span class="rounded-md bg-muted px-2 py-1 text-xs tabular-nums text-muted-foreground">{{ fontSize[0] }} px</span>
            </div>
            <Slider id="calendar-font-size" v-model="fontSize" :min="10" :max="40" :step="1" aria-label="字号" />
          </div>
          <Separator />
          <div class="grid gap-4 pb-1">
            <div class="flex items-center justify-between">
              <Label for="calendar-border-radius">圆角</Label>
              <span class="rounded-md bg-muted px-2 py-1 text-xs tabular-nums text-muted-foreground">{{ borderRadius[0] }} px</span>
            </div>
            <Slider id="calendar-border-radius" v-model="borderRadius" :min="0" :max="50" :step="1" aria-label="圆角" />
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
.calendar-config {
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
