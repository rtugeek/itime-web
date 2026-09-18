<script lang="ts" setup>
import { useWidget } from '@widget-js/vue3'
import { BrowserWindowApi, DefaultWidgetTheme } from '@widget-js/core'
import { Check } from '@lucide/vue'
import ThemeColorPicker from '@/components/ThemeColorPicker.vue'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const { widgetTheme } = useWidget({ defaultTheme: DefaultWidgetTheme.copy(), immediate: false })

const colorFields = [
  { key: 'backgroundColor', label: '背景颜色' },
] as const
</script>

<template>
  <div class="birthday-list-config mx-auto flex w-full max-w-2xl flex-col gap-4 py-2">
    <Card class="gap-5 rounded-xl py-5 shadow-none">
      <CardHeader class="gap-1 px-5">
        <CardTitle class="text-base font-semibold">
          外观设置
        </CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col gap-5 px-5">
        <div class="flex items-center justify-between gap-4">
          <div class="grid gap-1.5">
            <Label for="birthday-global-theme">使用全局主题</Label>
            <p class="text-xs text-muted-foreground">
              跟随桌面组件的统一外观
            </p>
          </div>
          <Switch id="birthday-global-theme" v-model="widgetTheme.useGlobalTheme" />
        </div>
        <template v-if="!widgetTheme.useGlobalTheme">
          <Separator />
          <div v-for="field in colorFields" :key="field.key" class="config-row">
            <Label :for="`birthday-${field.key}`">{{ field.label }}</Label>
            <ThemeColorPicker :id="`birthday-${field.key}`" v-model="widgetTheme[field.key]" :label="field.label" />
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
.birthday-list-config {
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
