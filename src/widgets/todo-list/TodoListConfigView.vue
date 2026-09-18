<script lang="ts" setup>
import { computed } from 'vue'
import { useWidget } from '@widget-js/vue3'
import { useStorage } from '@vueuse/core'
import { BrowserWindowApi, DefaultWidgetTheme } from '@widget-js/core'
import { useI18n } from 'vue-i18n'
import { Check } from '@lucide/vue'
import ThemeColorPicker from '@/components/ThemeColorPicker.vue'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

const { t } = useI18n()
const title = useStorage('title', t('todo.title'))
// The SDK default is frozen; each editable theme needs its own mutable copy.
const { widgetTheme } = useWidget({ defaultTheme: DefaultWidgetTheme.copy(), immediate: false })
const colorFields = [
  { key: 'backgroundColor', label: '背景颜色' },
  { key: 'color', label: '文字颜色' },
  { key: 'dividerColor', label: '分隔线颜色' },
] as const
const borderRadius = computed({
  get: () => [Number.parseFloat(String(widgetTheme.value.borderRadius ?? 0)) || 0],
  set: (value: number[]) => {
    widgetTheme.value.borderRadius = `${value[0] ?? 0}px`
  },
})
</script>

<template>
  <div class="todo-config mx-auto flex w-full max-w-2xl flex-col gap-4 py-2">
    <Card class="gap-5 rounded-xl py-5 shadow-none">
      <CardHeader class="gap-1 px-5">
        <CardTitle class="text-base font-semibold">
          常规设置
        </CardTitle>
      </CardHeader>
      <CardContent class="grid gap-2 px-5">
        <Label for="todo-widget-title">组件标题</Label>
        <Input id="todo-widget-title" v-model="title" :placeholder="t('todo.title')" />
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
            <Label for="todo-global-theme">使用全局主题</Label>
            <p class="text-xs text-muted-foreground">
              跟随桌面组件的统一外观
            </p>
          </div>
          <Switch id="todo-global-theme" v-model="widgetTheme.useGlobalTheme" />
        </div>
        <template v-if="!widgetTheme.useGlobalTheme">
          <Separator />
          <div v-for="field in colorFields" :key="field.key" class="config-row">
            <Label :for="`todo-${field.key}`">{{ field.label }}</Label>
            <ThemeColorPicker :id="`todo-${field.key}`" v-model="widgetTheme[field.key]" :label="field.label" />
          </div>
          <Separator />
          <div class="grid gap-4 pb-1">
            <div class="flex items-center justify-between">
              <Label for="todo-border-radius">圆角</Label>
              <span class="rounded-md bg-muted px-2 py-1 text-xs tabular-nums text-muted-foreground">{{ borderRadius[0] }} px</span>
            </div>
            <Slider id="todo-border-radius" v-model="borderRadius" :min="0" :max="50" :step="1" aria-label="圆角" />
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
.todo-config {
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
