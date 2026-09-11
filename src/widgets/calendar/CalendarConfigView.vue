<script lang="ts" setup>
import { computed } from 'vue'
import { WidgetConfigOption, useWidget } from '@widget-js/vue3'
import { useStorage } from '@vueuse/core'
import { AppConfig } from '@/common/AppConfig'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const { widgetParams, save } = useWidget()

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

const widgetConfigOption = new WidgetConfigOption({
  custom: true,
  theme: {
    backgroundColor: true,
    borderRadius: true,
    color: true,
    primaryColor: true,
    fontSize: [10, 40],
  },
})
</script>

<template>
  <WidgetEditDialog
    :widget-params="widgetParams"
    :option="widgetConfigOption"
    @apply="save()"
    @confirm="save({ closeWindow: true })"
  >
    <template #custom>
      <el-form-item label="一周开始日">
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
      </el-form-item>
    </template>
  </WidgetEditDialog>
</template>

<style>
body{
  background-color: transparent;
}
</style>
