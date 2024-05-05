<script lang="ts" setup>
import { WidgetConfigOption, useWidget } from '@widget-js/vue3'
import { WidgetData } from '@widget-js/core'

const { widgetData, widgetParams, save } = useWidget(WidgetData)

// 修改成需要设置组件参数配置
const widgetConfigOption = new WidgetConfigOption({
  theme: {
    backgroundColor: true,
    borderRadius: true,
    color: true,
    primaryColor:true
  },
})
</script>

<template>
  <widget-edit-dialog
    v-model="widgetData"
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
