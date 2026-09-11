<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { HTMLAttributes } from 'vue'
import { DateFormatter, fromDate, getLocalTimeZone, toCalendarDate, today } from '@internationalized/date'
import { CalendarIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const props = defineProps<{
  id?: string
  class?: HTMLAttributes['class']
  placeholder?: string
  disabled?: boolean
  minDate?: Date | string
  maxDate?: Date | string
}>()

const model = defineModel<Date>()
const open = ref(false)
const { locale } = useI18n()
const timeZone = getLocalTimeZone()
const calendarLocale = computed(() => locale.value.startsWith('zh') ? 'zh-CN' : locale.value)
const placeholderText = computed(() => props.placeholder ?? (locale.value.startsWith('zh') ? '选择日期' : 'Pick a date'))

function asCalendarDate(value?: Date | string) {
  if (!value) { return undefined }
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : toCalendarDate(fromDate(date, timeZone))
}

const selectedDate = computed(() => asCalendarDate(model.value))
const minValue = computed(() => asCalendarDate(props.minDate))
const maxValue = computed(() => asCalendarDate(props.maxDate))
const defaultPlaceholder = computed(() => {
  const date = selectedDate.value ?? today(timeZone)
  if (minValue.value && date.compare(minValue.value) < 0) { return minValue.value }
  if (maxValue.value && date.compare(maxValue.value) > 0) { return maxValue.value }
  return date
})
const dateText = computed(() => selectedDate.value
  ? new DateFormatter(calendarLocale.value, { dateStyle: 'medium' }).format(selectedDate.value.toDate(timeZone))
  : placeholderText.value)

function selectDate(value: DateValue | undefined) {
  if (!value) { return }
  model.value = value.toDate(timeZone)
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        :id="id"
        type="button"
        variant="outline"
        :disabled="disabled"
        :class="cn('w-full min-w-0 justify-start gap-2 px-3 text-left font-normal', !selectedDate && 'text-muted-foreground', props.class)"
      >
        <slot name="left">
          <CalendarIcon class="size-4 shrink-0 text-muted-foreground" />
        </slot>
        <span class="truncate">{{ dateText }}</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" class="w-auto max-h-(--reka-popover-content-available-height) overflow-auto p-0">
      <Calendar
        :model-value="selectedDate"
        :default-placeholder="defaultPlaceholder"
        :min-value="minValue"
        :max-value="maxValue"
        :locale="calendarLocale"
        :initial-focus="true"
        :prevent-deselect="true"
        layout="month-and-year"
        @update:model-value="selectDate"
      />
    </PopoverContent>
  </Popover>
</template>
