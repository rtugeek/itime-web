<script lang="ts" setup>
import {
  WidgetConfigOption,
  useWidget,
} from '@widget-js/vue3'
import {
  WidgetData,
  WidgetDataApi,
} from '@widget-js/core'

const {
  widgetData,
  widgetParams,
} = useWidget(WidgetData, { loadDataByWidgetName: true })

// 修改成需要设置组件参数配置
const widgetConfigOption = new WidgetConfigOption({
  custom: false,
  theme: {
    backgroundColor: true,
    borderRadius: true,
    color: true,
    dividerColor: true,
  },
})

async function onSaveClick() {
  await WidgetDataApi.saveByName(widgetData.value)
  window.close()
}
async function onApplyClick() {
  await WidgetDataApi.saveByName(widgetData.value)
}
</script>

<template>
  <WidgetEditDialog
    v-model="widgetData"
    :widget-params="widgetParams"
    :option="widgetConfigOption"
    @apply="onApplyClick"
    @confirm="onSaveClick"
  />
</template>

<style scoped></style>
