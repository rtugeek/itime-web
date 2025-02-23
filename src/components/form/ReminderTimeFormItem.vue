<script setup lang="ts">
import { AlarmClock } from '@icon-park/vue-next'
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import DateTimePicker from '@/components/DateTimePicker.vue'

const model = defineModel<string>()
const enable = defineModel<boolean>('enable')

const showReminderDatePicker = ref(false)

const reminderDateTimeText = computed(() => {
  if (model.value) {
    return dayjs(model.value).format('YYYY/MM/DD HH:mm')
  }
  return ''
})

const dateModel = computed({
  get: () => {
    if (model.value) {
      return dayjs(model.value).toDate()
    }
    return undefined
  },
  set: (val: Date | undefined) => {
    model.value = val ? val.toISOString() : undefined
  },
})

function onCancel() {
  if (!model.value) {
    enable.value = false
  }
}

function onConfirm(newValue: Date) {
  if (newValue) {
    enable.value = true
  }
}
</script>

<template>
  <div>
    <nut-form-item :label-width="30">
      <template #label>
        <AlarmClock />
      </template>
      <nut-input
        v-model="reminderDateTimeText" readonly class="w-full cursor-pointer" placeholder="提醒"
        @click="showReminderDatePicker = true"
      >
        <template #right>
          <el-switch v-model="enable" />
        </template>
      </nut-input>
    </nut-form-item>
    <DateTimePicker v-model="showReminderDatePicker" v-model:date-time="dateModel" type="datetime" @confirm="onConfirm" @cancel="onCancel" />
  </div>
</template>

<style scoped lang="scss">

</style>
