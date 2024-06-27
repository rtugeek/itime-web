<script lang="ts" setup>
import {
  WidgetConfigOption,
  useWidget,
} from '@widget-js/vue3'

const {
  widgetParams,
} = useWidget()

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
  window.close()
}
async function onApplyClick() {
}
</script>

<template>
  <WidgetEditDialog
    :widget-params="widgetParams"
    :option="widgetConfigOption"
    @apply="onApplyClick"
    @confirm="onSaveClick"
  />
</template>

<style scoped></style>
