<script lang="ts" setup>
import { useWidget, useWidgetTheme } from '@widget-js/vue3'
import { useStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { computed } from 'vue'
import { DefaultWidgetTheme } from '@widget-js/core'
import { AppConfig } from '@/common/AppConfig'
import type { DeadlineConfig } from '@/widgets/deadline/DeadlineConfig'

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
</script>

<template>
  <BaseView title="Deadline设置">
    <div class="p2 flex flex-col gap-2">
      <div>
        <h4>Deadline设置</h4>
        <NutForm>
          <NutFormItem label="标题">
            <NutInput v-model="deadlineConfig.title" />
          </NutFormItem>
          <NutFormItem label="开始日期">
            <DateInput v-model="deadlineConfig.startTime" :lunar="false" />
          </NutFormItem>
          <NutFormItem label="最后期限">
            <DateInput v-model="deadlineConfig.endTime" :min-date="minEndDate" :lunar="false" />
          </NutFormItem>
        </NutForm>
      </div>
      <div>
        <h4>主题设置</h4>
        <NutForm>
          <NutFormItem label="使用全局主题">
            <NutSwitch v-model="widgetTheme.useGlobalTheme" />
          </NutFormItem>
          <NutFormItem v-show="!widgetTheme.useGlobalTheme" label="主色调">
            <NutColorPicker v-model="widgetTheme.primaryColor" />
          </NutFormItem>

          <NutFormItem v-show="!widgetTheme.useGlobalTheme" label="背景颜色">
            <NutColorPicker v-model="widgetTheme.backgroundColor" />
          </NutFormItem>

          <NutFormItem v-show="!widgetTheme.useGlobalTheme" label="背景圆角">
            <NutRange v-model="borderRadius" :min="0" :max="50" />
          </NutFormItem>
        </NutForm>
      </div>
    </div>
  </BaseView>
</template>

<style scoped></style>
