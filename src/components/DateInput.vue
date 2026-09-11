<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, ref, watch } from 'vue'
import { CalendarIcon } from '@lucide/vue'
import { Lunar } from 'lunar-typescript'
import DatePicker from '@/components/DatePicker.vue'
import LunarPickerDialog from '@/components/dialog/LunarPickerDialog.vue'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const props = withDefaults(defineProps<{
  lunar?: boolean
  minDate?: Date | string
}>(), {
  lunar: true,
  minDate: () => dayjs().subtract(100, 'year').toDate(),
})

const modelValue = defineModel({ default: () => new Date() })
const dateType = defineModel('dateType', { default: 0 })
const showLunarPicker = ref(false)
const selectedLunarDate = ref(modelValue.value)
const lunarText = computed(() => Lunar.fromDate(modelValue.value).toString())

watch(modelValue, (value) => {
  selectedLunarDate.value = value
})

function onLunarDateConfirm() {
  modelValue.value = selectedLunarDate.value
  showLunarPicker.value = false
}

function onDateTypeChange(value: unknown) {
  if (value !== '0' && value !== '1') { return }
  dateType.value = Number(value)
  showLunarPicker.value = false
}
</script>

<template>
  <div class="flex min-w-0 items-center gap-3">
    <ToggleGroup v-if="lunar" type="single" variant="outline" class="shrink-0" :model-value="String(dateType)" orientation="horizontal" aria-label="日期类型" @update:model-value="onDateTypeChange">
      <ToggleGroupItem value="0" aria-label="公历">
        公历
      </ToggleGroupItem>
      <ToggleGroupItem value="1" aria-label="农历">
        农历
      </ToggleGroupItem>
    </ToggleGroup>
    <DatePicker v-if="dateType === 0 || !lunar" v-model="modelValue" class="w-auto flex-1" :min-date="props.minDate">
      <template v-if="$slots.left" #left>
        <slot name="left" />
      </template>
    </DatePicker>
    <Button v-else type="button" variant="outline" class="min-w-0 flex-1 justify-start gap-2 px-3 font-normal" @click="showLunarPicker = true">
      <slot name="left">
        <CalendarIcon class="size-4 shrink-0 text-muted-foreground" />
      </slot>
      <span class="truncate">{{ lunarText }}</span>
    </Button>
  </div>
  <LunarPickerDialog
    v-if="lunar"
    v-model="selectedLunarDate"
    v-model:visible="showLunarPicker"
    @confirm="onLunarDateConfirm"
  />
</template>
