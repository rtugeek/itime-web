<script setup lang="ts">
import { Lunar, LunarYear } from 'lunar-typescript'
import { nextTick, onMounted, ref, watch } from 'vue'
import { LunarUtils } from '@/utils/LunarUtils'

const emits = defineEmits(['confirm', 'cancel'])
const model = defineModel({ default: new Date() })
const selectedLunarDate = ref<number[]>([1949, 10, 1])
const lunarColumns = ref(generateYearLunar())
function updateSelectedLunar() {
  const lunar = Lunar.fromDate(model.value)
  selectedLunarDate.value = [lunar.getYear(), lunar.getMonth(), lunar.getDay()]
}

function onLunarDateConfirm() {
  const lunar = Lunar.fromYmd(selectedLunarDate.value[0], selectedLunarDate.value[1], selectedLunarDate.value[2])
  model.value = LunarUtils.lunarToDate(lunar)
  emits('confirm')
}

interface LunarPickData {
  text: string
  value: number
  children: LunarPickData[]
}

watch(() => model.value, () => {
  updateSelectedLunar()
})

function generateYearLunar() {
  // 生成 1911年到2099年的农历年份
  const lunarData: LunarPickData[] = []
  for (let year = 1949; year <= 2099; year++) {
    const lunarYear = LunarYear.fromYear(year)
    const data: LunarPickData = {
      text: `${year}年`,
      value: year,
      children: [],
    }
    lunarYear.getMonthsInYear().forEach((lunarMonth) => {
      const monthData: LunarPickData = {
        text: LunarUtils.getLunarMonthText(lunarMonth.getMonth()),
        value: lunarMonth.getMonth(),
        children: [],
      }
      for (let i = 1; i <= lunarMonth.getDayCount(); i++) {
        monthData.children.push({
          text: LunarUtils.getLunarDayText(i),
          value: i,
        })
      }
      data.children.push(monthData)
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
  <nut-picker
    v-model="selectedLunarDate"
    title="选择日期" :columns="lunarColumns"
    @confirm="onLunarDateConfirm"
    @cancel="emits('cancel')"
  />
</template>

<style scoped lang="scss">

</style>
