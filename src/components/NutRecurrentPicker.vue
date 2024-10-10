<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RRuleUtils } from '@/utils/RRuleUtils'

const modelValue = defineModel({ type: Boolean, default: false })
const rrule = defineModel('rrule', { type: String, default: '' })

const { t } = useI18n()

const rrules = ref([
  { text: t('recurrence.none'), value: '' },
  { text: t('recurrence.daily'), value: RRuleUtils.DAILY_STR },
  { text: t('recurrence.weekly'), value: RRuleUtils.WEEKLY_STR },
  { text: t('recurrence.monthly'), value: RRuleUtils.MONTHLY_STR },
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
      v-model="rruleModel" :columns="rrules" :title="t('recurrence.title')" :three-dimensional="false"
      @confirm="onConfirm"
      @cancel="modelValue = false"
    />
  </nut-popup>
</template>

<style scoped>

</style>
