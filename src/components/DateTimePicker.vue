<script setup lang="ts">
import { ref } from 'vue'
import { useVModel } from '@vueuse/core'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  dateTime: {
    type: Date,
  },
})

const emits = defineEmits(['update:modelValue', 'update:dateTime'])
const max = new Date(2035, 10, 1)

const model = useVModel(props, 'modelValue', emits)
const now = new Date()
const dateModel = ref(now)

function onConfirm() {
  model.value = false
  if (dateModel.value) {
    emits('update:dateTime', dateModel.value)
  }
  else {
    emits('update:dateTime', undefined)
  }
}

function formatter(type: string, option: any) {
  switch (type) {
    case 'year':
      option.text += '年'
      break
    case 'month':
      option.text += '月'
      break
    case 'day':
      option.text += '日'
      break
    case 'hour':
      option.text += '时'
      break
    case 'minute':
      option.text += '分'
      break
    default:
      option.text += ''
  }
  return option
}
</script>

<template>
  <nut-popup v-model:visible="model" position="bottom">
    <nut-date-picker
      v-model="dateModel"
      :min-date="now"
      type="datetime"
      :max-date="max"
      :formatter="formatter"
      :three-dimensional="false"
      @confirm="onConfirm"
      @cancel="model = false"
    />
  </nut-popup>
</template>

<style scoped>

</style>
