<script lang="ts" setup>
import {
  WidgetConfigOption,
  useWidget,
} from '@widget-js/vue3'
import { useStorage } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

const {
  widgetParams,
} = useWidget()

const { t } = useI18n()
const title = useStorage('title', t('todo.title'))
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
