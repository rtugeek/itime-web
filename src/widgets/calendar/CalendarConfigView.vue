<script lang="ts" setup>
import { WidgetConfigOption, useWidget } from '@widget-js/vue3'

const { widgetParams, save } = useWidget()

// 修改成需要设置组件参数配置
const widgetConfigOption = new WidgetConfigOption({
  custom: false,
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
  <widget-edit-dialog
    :widget-params="widgetParams"
    :option="widgetConfigOption"
    @apply="save()"
    @confirm="save({ closeWindow: true })"
  />
</template>

<style>
body{
  background-color: transparent;
}
</style>
