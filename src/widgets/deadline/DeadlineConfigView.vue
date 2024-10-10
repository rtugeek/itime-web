<script lang="ts" setup>
import { useWidget, useWidgetTheme } from '@widget-js/vue3'
import { useStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { computed } from 'vue'
import { DefaultWidgetTheme } from '@widget-js/core'
import { useI18n } from 'vue-i18n'
import { AppConfig } from '@/common/AppConfig'
import type { DeadlineConfig } from '@/widgets/deadline/DeadlineConfig'

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
</script>

<template>
  <BaseView :title="t('deadlineSetting.title')">
    <div class="p2 flex flex-col gap-2">
      <div>
        <h4>{{ t('deadlineSetting.title') }}</h4>
        <NutForm>
          <NutFormItem :label="t('deadlineSetting.form.title')">
            <NutInput v-model="deadlineConfig.title" />
          </NutFormItem>
          <NutFormItem :label="t('deadlineSetting.form.startDate')">
            <DateInput v-model="deadlineConfig.startTime" :lunar="false" />
          </NutFormItem>
          <NutFormItem :label="t('deadlineSetting.form.endDate')">
            <DateInput v-model="deadlineConfig.endTime" :min-date="minEndDate" :lunar="false" />
          </NutFormItem>
        </NutForm>
      </div>
      <div>
        <h4>{{ t('themeSetting.title') }}</h4>
        <NutForm>
          <NutFormItem :label="t('themeSetting.useGlobalTheme')">
            <NutSwitch v-model="widgetTheme.useGlobalTheme" />
          </NutFormItem>
          <NutFormItem v-show="!widgetTheme.useGlobalTheme" :label="t('themeSetting.primaryColor')">
            <NutColorPicker v-model="widgetTheme.primaryColor" />
          </NutFormItem>

          <NutFormItem v-show="!widgetTheme.useGlobalTheme" :label="t('themeSetting.backgroundColor')">
            <NutColorPicker v-model="widgetTheme.backgroundColor" />
          </NutFormItem>

          <NutFormItem v-show="!widgetTheme.useGlobalTheme" :label="t('themeSetting.borderRadius')">
            <NutRange v-model="borderRadius" :min="0" :max="50" />
          </NutFormItem>
        </NutForm>
      </div>
    </div>
  </BaseView>
</template>

<style scoped></style>
