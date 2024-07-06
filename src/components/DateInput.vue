<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, nextTick, onMounted, ref } from 'vue'
import { Lunar } from 'lunar-typescript'

defineProps({
  lunar: {
    type: Boolean,
    default: true,
  },
  minDate: {
    type: Date,
  },
})
const modelValue = defineModel({ default: new Date() })
const dateType = defineModel('dateType', { default: 0 })
const showDateTimePicker = ref(false)
const showLunarPicker = ref(false)
const selectedDate = ref(new Date())
onMounted(async () => {
  await nextTick()
  selectedDate.value = modelValue.value
})
const selectedLunarDate = ref(modelValue.value)
const textModel = computed({
  get: () => {
    if (dateType.value == 0) {
      return dayjs(modelValue.value).format('YYYY年MM月DD日')
    }
    else {
      return Lunar.fromDate(modelValue.value).toString()
    }
  },
  set: (_val) => {

  },
})

function onDateTimeConfirm() {
  modelValue.value = selectedDate.value
  showDateTimePicker.value = false
}

function onLunarDateConfirm() {
  modelValue.value = selectedLunarDate.value
  showLunarPicker.value = false
}

function showPicker() {
  if (dateType.value == 0) {
    showDateTimePicker.value = true
  }
  else {
    showLunarPicker.value = true
  }
}
</script>

<template>
  <nut-input
    v-model="textModel" readonly placeholder="时间" @click="showPicker"
    @focus="showDateTimePicker = true"
  >
    <template #left>
      <slot name="left" />
    </template>
    <template v-if="lunar" #right>
      <nut-radio-group v-model="dateType" direction="horizontal" @click.stop="">
        <nut-radio :label="0">
          公历
        </nut-radio>
        <nut-radio :label="1">
          农历
        </nut-radio>
      </nut-radio-group>
    </template>
  </nut-input>
  <nut-popup v-model:visible="showDateTimePicker" position="bottom">
    <nut-date-picker
      v-model="selectedDate"
      title="选择日期"
      type="date"
      :min-date="minDate"
      :is-show-chinese="true"
      :three-dimensional="false"
      @confirm="onDateTimeConfirm"
      @cancel="showDateTimePicker = false"
    />
  </nut-popup>
  <nut-popup v-if="lunar" v-model:visible="showLunarPicker" position="bottom">
    <nut-lunar-date-picker v-model="selectedLunarDate" @cancel="showLunarPicker = false" @confirm="onLunarDateConfirm" />
  </nut-popup>
</template>

<style scoped lang="scss">

</style>
