<template>
  <widget-edit-dialog
    :widget-params="widgetParams"
    :option="widgetConfigOption"
    v-model="widgetData"
    @apply="save()"
    @confirm="save({ closeWindow: true })"
  >
  </widget-edit-dialog>
</template>

<script lang="ts" setup>
import { useWidget, WidgetConfigOption } from '@widget-js/vue3';
import { WidgetData } from '@widget-js/core';

const { widgetData, widgetParams, save } = useWidget(WidgetData);

//修改成需要设置组件参数配置
const widgetConfigOption = new WidgetConfigOption({
  theme: {
    backgroundColor: true,
    borderRadius: true,
    color: true,
  },
});
</script>

<style scoped></style>
