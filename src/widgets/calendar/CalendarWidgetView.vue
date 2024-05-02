<template>
  <widget-wrapper>
    <span>Hello World!</span>
  </widget-wrapper>
</template>

<script lang="ts" setup>
import { WidgetData } from '@widget-js/core';
import { useWidget } from '@widget-js/vue3';

const { widgetData, widgetParams } = useWidget(WidgetData);
</script>

<style scoped></style>
