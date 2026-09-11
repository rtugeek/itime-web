<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useVModel } from '@vueuse/core'
import dayjs from 'dayjs'
import { toDate } from 'reka-ui/date'
import { getLocalTimeZone, parseDate } from '@internationalized/date'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  dateTime: {
    type: Date,
  },
  type: {
    type: String,
    default: 'date',
  },
})

const emits = defineEmits(['update:modelValue', 'update:dateTime', 'cancel', 'confirm'])
const max = new Date(2099, 10, 1)

const model = useVModel(props, 'modelValue', emits)
const now = new Date()
const dateModel = ref(now)

const selectedHour = ref(0)
const selectedMinute = ref(0)

const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = Array.from({ length: 60 }, (_, i) => i)

const calendarDate = computed({
  get: () => {
    const date = dateModel.value
    return parseDate(dayjs(date).format('YYYY-MM-DD'))
  },
  set: (val: any) => {
    if (val) {
      const newDate = toDate(val, getLocalTimeZone())
      if (props.type === 'datetime') {
        dateModel.value = dayjs(newDate)
          .hour(selectedHour.value)
          .minute(selectedMinute.value)
          .toDate()
      }
      else {
        dateModel.value = newDate
      }
    }
  },
})

const minCalendarDate = computed(() => {
  return parseDate(dayjs(now).format('YYYY-MM-DD'))
})

const maxCalendarDate = computed(() => {
  return parseDate(dayjs(max).format('YYYY-MM-DD'))
})

watch([selectedHour, selectedMinute], () => {
  if (props.type === 'datetime') {
    dateModel.value = dayjs(dateModel.value)
      .hour(selectedHour.value)
      .minute(selectedMinute.value)
      .toDate()
  }
})

watch(() => props.dateTime, (val) => {
  if (val) {
    dateModel.value = val
    selectedHour.value = dayjs(val).hour()
    selectedMinute.value = dayjs(val).minute()
  }
}, { immediate: true })

watch(model, (val) => {
  if (val && props.dateTime) {
    dateModel.value = props.dateTime
    selectedHour.value = dayjs(props.dateTime).hour()
    selectedMinute.value = dayjs(props.dateTime).minute()
  }
})

function onConfirm() {
  model.value = false
  if (dateModel.value) {
    emits('update:dateTime', dateModel.value)
    emits('confirm', dateModel.value)
  }
  else {
    emits('update:dateTime', undefined)
    emits('confirm', undefined)
  }
}

function cancel() {
  model.value = false
  emits('cancel')
}
</script>

<template>
  <Sheet v-model:open="model">
    <SheetContent side="bottom" class="h-auto max-h-[90vh] px-4 pt-5 pb-4">
      <SheetHeader class="pb-2">
        <SheetTitle class="text-base font-semibold">
          {{ type === 'datetime' ? '选择日期时间' : '选择日期' }}
        </SheetTitle>
      </SheetHeader>
      <div class="py-2">
        <Calendar
          v-model="calendarDate"
          :min-value="minCalendarDate"
          :max-value="maxCalendarDate"
          layout="month-and-year"
          class="px-1"
        />
        <div v-if="type === 'datetime'" class="mt-4 flex items-end gap-3 px-1">
          <div class="flex-1 space-y-1.5">
            <Label class="text-xs text-muted-foreground font-medium">时</Label>
            <NativeSelect v-model="selectedHour" class="w-full h-10">
              <NativeSelectOption
                v-for="hour in hours"
                :key="hour"
                :value="hour"
                :selected="selectedHour === hour"
              >
                {{ hour.toString().padStart(2, '0') }}时
              </NativeSelectOption>
            </NativeSelect>
          </div>
          <div class="pb-2.5 text-lg font-semibold text-muted-foreground">
            :
          </div>
          <div class="flex-1 space-y-1.5">
            <Label class="text-xs text-muted-foreground font-medium">分</Label>
            <NativeSelect v-model="selectedMinute" class="w-full h-10">
              <NativeSelectOption
                v-for="minute in minutes"
                :key="minute"
                :value="minute"
                :selected="selectedMinute === minute"
              >
                {{ minute.toString().padStart(2, '0') }}分
              </NativeSelectOption>
            </NativeSelect>
          </div>
        </div>
      </div>
      <SheetFooter class="flex-col gap-2 pt-2 sm:flex-row sm:gap-3">
        <Button variant="outline" class="flex-1 h-10" @click="cancel">
          取消
        </Button>
        <Button class="flex-1 h-10" @click="onConfirm">
          确定
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
</style>
