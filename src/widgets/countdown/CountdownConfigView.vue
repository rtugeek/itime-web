<script lang="ts" setup>
import { computed } from 'vue'
import { useWidget } from '@widget-js/vue3'
import { useStorage } from '@vueuse/core'
import { BrowserWindowApi, DefaultWidgetTheme } from '@widget-js/core'
import { Check } from '@lucide/vue'
import { Lunar } from 'lunar-typescript'
import dayjs from 'dayjs'
import ThemeColorPicker from '@/components/ThemeColorPicker.vue'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCountdownEventStore } from '@/stores/useCountdownEventStore'

const { widgetParams, widgetTheme } = useWidget({
  defaultTheme: DefaultWidgetTheme.copy({
    useGlobalTheme: false,
    primaryColor: 'rgb(0,149,255)',
    backgroundColor: 'white',
    borderRadius: '8px',
  }),
  immediate: false,
})
const countdownEventStore = useCountdownEventStore()
const countdownEventId = useStorage<string>(`countdownEventId-${widgetParams.id}`, '')

const borderRadius = computed({
  get: () => [Number.parseFloat(String(widgetTheme.value.borderRadius ?? '8')) || 0],
  set: (value: number[]) => {
    widgetTheme.value.borderRadius = `${value[0] ?? 0}px`
  },
})

function formatEventDate(event: any) {
  if (event.dateType === 1) {
    return Lunar.fromDate(dayjs(event.dateTime).toDate()).toString()
  }
  return dayjs(event.dateTime).format('YYYY/MM/DD')
}
</script>

<template>
  <div class="countdown-config mx-auto flex w-full max-w-2xl flex-col gap-4 py-2">
    <Card class="gap-5 rounded-xl py-5 shadow-none">
      <CardHeader class="gap-1 px-5">
        <CardTitle class="text-base font-semibold">
          倒计时选择
        </CardTitle>
        <CardDescription>
          选择要在组件中显示的倒计时事件
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-2 px-5">
        <Select v-model="countdownEventId" :disabled="countdownEventStore.events.length === 0">
          <SelectTrigger id="countdown-event-select">
            <SelectValue placeholder="请选择倒计时事件" />
          </SelectTrigger>
          <SelectContent class="max-h-60">
            <SelectItem
              v-for="event in countdownEventStore.events"
              :key="event.id"
              :value="event.id"
              class="flex items-center gap-2"
            >
              <span class="font-medium">{{ event.name }}</span>
              <span class="text-xs text-muted-foreground">{{ formatEventDate(event) }}</span>
            </SelectItem>
          </SelectContent>
        </Select>
        <p v-if="countdownEventStore.events.length === 0" class="text-sm text-muted-foreground py-2">
          暂无倒计时事件，请先添加
        </p>
      </CardContent>
    </Card>
    <Card class="gap-5 rounded-xl py-5 shadow-none">
      <CardHeader class="gap-1 px-5">
        <CardTitle class="text-base font-semibold">
          外观设置
        </CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col gap-5 px-5">
        <div class="config-row">
          <Label for="countdown-primary-color">主题颜色</Label>
          <ThemeColorPicker id="countdown-primary-color" v-model="widgetTheme.primaryColor" label="主题颜色" />
        </div>
        <Separator />
        <div class="grid gap-4 pb-1">
          <div class="flex items-center justify-between">
            <Label for="countdown-border-radius">背景圆角</Label>
            <span class="rounded-md bg-muted px-2 py-1 text-xs tabular-nums text-muted-foreground">{{ borderRadius[0] }} px</span>
          </div>
          <Slider id="countdown-border-radius" v-model="borderRadius" :min="0" :max="50" :step="1" aria-label="背景圆角" />
        </div>
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
.countdown-config {
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
