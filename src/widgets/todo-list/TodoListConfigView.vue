<script lang="ts" setup>
import {
  WidgetConfigOption,
  useContextMenu,
  useWidget,
} from '@widget-js/vue3'
import { useStorage } from '@vueuse/core'

const {
  widgetParams,
} = useWidget()

const title = useStorage('title', '代办事项')
// 修改成需要设置组件参数配置
const widgetConfigOption = new WidgetConfigOption({
  custom: true,
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
  >
    <template #custom>
      <el-form-item label="组件标题" prop="backgroundColor">
        <el-input v-model="title" />
      </el-form-item>
    </template>
  </WidgetEditDialog>
</template>

<style scoped></style>
