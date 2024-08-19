<script setup lang="ts">
import { computed, ref } from 'vue'
import { RRuleUtils } from '@/utils/RRuleUtils'

const modelValue = defineModel({ type: Boolean, default: false })
const rrule = defineModel('rrule', { type: String, default: '' })

const rrules = ref([
  { text: '不重复', value: '' },
  { text: '每天', value: RRuleUtils.DAILY_STR },
  { text: '每周', value: RRuleUtils.WEEKLY_STR },
  { text: '每月', value: RRuleUtils.MONTHLY_STR },
])

const rruleModel = computed<string[]>({
  get: () => {
    return [rrule.value]
  },
  set: (val: string[]) => {
    rrule.value = val[0]
  },
})

function onConfirm({ selectedValue }) {
  rrule.value = selectedValue[0]
  modelValue.value = false
}
//
// watch(rrule, (val) => {
//   console.log(val[0])
// })
</script>

<template>
  <nut-popup v-model:visible="modelValue" position="bottom">
    <nut-picker
      v-model="rruleModel" :columns="rrules" title="重复设置" :three-dimensional="false"
      @confirm="onConfirm"
      @cancel="modelValue = false"
    />
  </nut-popup>
</template>

<style scoped>

</style>
