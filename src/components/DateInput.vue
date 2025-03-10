<script setup lang="ts">
import dayjs from 'dayjs'
import { type PropType, computed, nextTick, onMounted, ref, watch } from 'vue'
import { Lunar } from 'lunar-typescript'
import { useI18n } from 'vue-i18n'

defineProps({
  lunar: {
    type: Boolean,
    default: true,
  },
  minDate: {
    type: Object as PropType<Date | string>,
    default: dayjs().subtract(100, 'year').toDate(),
  },
})

const { t, d } = useI18n({
  messages: {
    zh: {
      pickDate: '选择日期',
    },
    en: {
      pickDate: 'Pick Date',
    },
  },
})
const modelValue = defineModel({ default: new Date() })
const dateType = defineModel('dateType', { default: 0 })
const showDateTimePicker = ref(false)
const showLunarPicker = ref(false)
const selectedDate = ref(new Date())
onMounted(async () => {
  await nextTick()
  selectedDate.value = dayjs(modelValue.value).toDate()
  selectedLunarDate.value = modelValue.value
})
const selectedLunarDate = ref(modelValue.value)
const textModel = computed(() => {
  if (dateType.value == 0) {
    return d(modelValue.value)
  }
  else {
    return Lunar.fromDate(modelValue.value).toString()
  }
})

watch(() => modelValue.value, () => {
  selectedDate.value = dayjs(modelValue.value).toDate()
  selectedLunarDate.value = modelValue.value
})

function onDateTimeConfirm() {
  modelValue.value = selectedDate.value
  selectedLunarDate.value = modelValue.value
  showDateTimePicker.value = false
}

function onLunarDateConfirm() {
  modelValue.value = selectedLunarDate.value
  selectedDate.value = selectedLunarDate.value
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
      :title="t('pickDate')"
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
