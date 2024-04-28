<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { ref } from 'vue'
import { RRuleUtils } from '@/utils/RRuleUtils'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  rrule: {
    type: String,
  },
})

const emits = defineEmits(['update:modelValue', 'update:rrule'])

const rrules = ref([
  { text: '不重复', value: '' },
  { text: '每天', value: RRuleUtils.DAILY_STR },
  { text: '每周', value: RRuleUtils.WEEKLY_STR },
  { text: '每月', value: RRuleUtils.MONTHLY_STR },
])

const model = useVModel(props, 'modelValue', emits)
const rruleModel = ref([props.rrule ?? ''])

function onConfirm() {
  model.value = false
  if (rruleModel.value) {
    emits('update:rrule', rruleModel.value[0])
  }
  else {
    emits('update:rrule', undefined)
  }
}
</script>

<template>
  <nut-popup v-model:visible="model" position="bottom">
    <nut-picker
      v-model="rruleModel" :columns="rrules" title="重复设置" :three-dimensional="false"
      @confirm="onConfirm"
      @cancel="model = false"
    />
  </nut-popup>
</template>

<style scoped>

</style>
