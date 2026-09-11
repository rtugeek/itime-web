<script setup lang="ts">
import { Lunar, LunarYear } from 'lunar-typescript'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { LunarUtils } from '@/utils/LunarUtils'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  visible?: boolean
}>()

const emits = defineEmits(['confirm', 'cancel', 'update:visible'])
const model = defineModel({ default: new Date() })

const isOpen = ref(false)
const selectedYear = ref(1949)
const yearInput = ref<string | number>(1949)
const validYear = computed(() => Number.isInteger(Number(yearInput.value)) && Number(yearInput.value) >= 1949 && Number(yearInput.value) <= 2099)

watch(yearInput, (value) => {
  if (validYear.value) { selectedYear.value = Number(value) }
})
const selectedMonth = ref(1)
const selectedDay = ref(1)

const lunarYearData = ref(generateYearLunar())

const monthOptions = computed(() => {
  const yearData = lunarYearData.value.find(y => y.value === selectedYear.value)
  return yearData?.children || []
})

const dayOptions = computed(() => {
  const monthData = monthOptions.value.find(m => m.value === selectedMonth.value)
  return monthData?.children || []
})

watch(() => props.visible, (val) => {
  isOpen.value = !!val
  if (val) {
    updateSelectedLunar()
  }
})

watch(isOpen, (val) => {
  emits('update:visible', val)
})

watch(selectedYear, () => {
  if (monthOptions.value.length > 0 && !monthOptions.value.find(m => m.value === selectedMonth.value)) {
    selectedMonth.value = monthOptions.value[0].value
  }
})

watch(dayOptions, () => {
  if (dayOptions.value.length > 0 && !dayOptions.value.find(d => d.value === selectedDay.value)) {
    selectedDay.value = dayOptions.value[0].value
  }
})

function updateSelectedLunar() {
  const lunar = Lunar.fromDate(model.value)
  selectedYear.value = lunar.getYear()
  yearInput.value = selectedYear.value
  selectedMonth.value = lunar.getMonth()
  selectedDay.value = lunar.getDay()
}

function onLunarDateConfirm() {
  if (!validYear.value) { return }
  const lunar = Lunar.fromYmd(selectedYear.value, selectedMonth.value, selectedDay.value)
  model.value = LunarUtils.lunarToDate(lunar)
  isOpen.value = false
  emits('confirm')
}

function onCancel() {
  isOpen.value = false
  emits('cancel')
}

interface LunarPickData {
  text: string
  value: number
  children?: LunarPickData[]
}

watch(() => model.value, () => {
  updateSelectedLunar()
})

function generateYearLunar() {
  const lunarData: LunarPickData[] = []
  for (let year = 1949; year <= 2099; year++) {
    const lunarYear = LunarYear.fromYear(year)
    const data: LunarPickData = {
      text: `${year}年`,
      value: year,
      children: [],
    }
    lunarYear.getMonthsInYear().forEach((lunarMonth) => {
      const monthChildren: LunarPickData[] = []
      for (let i = 1; i <= lunarMonth.getDayCount(); i++) {
        monthChildren.push({
          text: LunarUtils.getLunarDayText(i),
          value: i,
        })
      }
      const monthData: LunarPickData = {
        text: LunarUtils.getLunarMonthText(lunarMonth.getMonth()),
        value: lunarMonth.getMonth(),
        children: monthChildren,
      }
      data.children!.push(monthData)
    })
    lunarData.push(data)
  }
  return lunarData
}

onMounted(async () => {
  await nextTick()
  updateSelectedLunar()
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent :aria-describedby="undefined" class="max-h-[85vh]">
      <DialogHeader class="text-left">
        <DialogTitle class="!text-foreground">
          选择农历日期
        </DialogTitle>
      </DialogHeader>
      <div class="grid grid-cols-3 gap-3">
        <div class="flex min-w-0 items-center gap-2">
          <Input id="lunar-year" v-model="yearInput" type="number" :min="1949" :max="2099" :step="1" :aria-invalid="!validYear" class="flex-1" /><Label for="lunar-year" class="shrink-0">年</Label>
        </div>
        <div class="flex min-w-0 items-center gap-2">
          <Select v-model="selectedMonth">
            <SelectTrigger id="lunar-month" class="min-w-0 flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="max-h-60">
              <SelectItem v-for="month in monthOptions" :key="month.value" :value="month.value">
                {{ month.text }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Label for="lunar-month" class="shrink-0">月</Label>
        </div>
        <div class="flex min-w-0 items-center gap-2">
          <Select v-model="selectedDay">
            <SelectTrigger id="lunar-day" class="min-w-0 flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="max-h-60">
              <SelectItem v-for="day in dayOptions" :key="day.value" :value="day.value">
                {{ day.text }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Label for="lunar-day" class="shrink-0">日</Label>
        </div>
      </div>
      <DialogFooter class="flex-row justify-end gap-2">
        <Button variant="outline" @click="onCancel">
          取消
        </Button>
        <Button :disabled="!validYear" @click="onLunarDateConfirm">
          确定
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped lang="scss">
</style>
