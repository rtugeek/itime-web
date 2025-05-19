<script lang="ts" setup>
import { type Solar, SolarMonth } from 'lunar-typescript'
import dayjs from 'dayjs'
import { ref } from 'vue'
import { useAppBroadcast, useWidget } from '@widget-js/vue3'
import { Left, Right } from '@icon-park/vue-next'
import { SystemApiEvent } from '@widget-js/core'
import { useI18n } from 'vue-i18n'
import CalendarDay from '@/widgets/calendar/CalendarDay.vue'
import { type HuangLi, PublicEventApi } from '@/api/PublicEventApi'
import AlmanacInfo from '@/widgets/calendar/AlmanacInfo.vue'

const today = ref(dayjs())
const currentMonth = ref(dayjs())
const currentMonthIndex = ref(today.value.month())
const solarMonth = ref(SolarMonth.fromYm(today.value.year(), today.value.month() + 1))
const weeks = ref(solarMonth.value.getWeeks(0))
const { t, d } = useI18n()

useWidget()

function next() {
  solarMonth.value = solarMonth.value.next(1)
  weeks.value = solarMonth.value.getWeeks(0)
  currentMonth.value = currentMonth.value.add(1, 'month')
  currentMonthIndex.value = currentMonth.value.month()
}

function previous() {
  solarMonth.value = solarMonth.value.next(-1)
  weeks.value = solarMonth.value.getWeeks(0)
  currentMonth.value = currentMonth.value.subtract(1, 'month')
  currentMonthIndex.value = currentMonth.value.month()
}

const almanac = ref<HuangLi[]>([])
PublicEventApi.getCalendar().then((it) => {
  almanac.value = it
})

function findAlmanac(solar: Solar) {
  return almanac.value.find((it) => {
    return it.year == solar.getYear() && it.month == solar.getMonth() && it.dayOfMonth == solar.getDay()
  })
}

function refresh() {
  today.value = dayjs()
  currentMonth.value = dayjs()
  currentMonthIndex.value = today.value.month()
  solarMonth.value = SolarMonth.fromYm(today.value.year(), today.value.month() + 1)
  weeks.value = solarMonth.value.getWeeks(0)
}

useAppBroadcast([SystemApiEvent.DATE_CHANGED], () => {
  refresh()
})

const weekKeyPath = ['week.short.sunday', 'week.short.monday', 'week.short.tuesday', 'week.short.wednesday', 'week.short.thursday', 'week.short.friday', 'week.short.saturday']
const showDetail = ref(false)
const selectedAlmanac = ref<HuangLi>()
const selectedSolar = ref<Solar>()

const show = (solar: Solar) => {
  selectedAlmanac.value = findAlmanac(solar)
  selectedSolar.value = solar
  if (selectedAlmanac.value) {
    showDetail.value = true
  }
}
</script>

<template>
  <widget-wrapper>
    <div class="root flex flex-col h-full">
      <div class="flex items-baseline gap-2 py-3 px-4">
        <div class="text-xl font-bold">
          {{ d(currentMonth.toDate(), 'yearMonth') }}
        </div>
        <div v-if="currentMonthIndex == today.month()" class="text-xs">
          {{ t('week.number', { week: currentMonth.isoWeek() }) }}
        </div>
        <div class="ml-auto flex gap-1 btn-group text-center">
          <div class="btn btn-next flex items-center rounded-full cursor-pointer justify-center" @click="previous">
            <Left :size="20" />
          </div>
          <div class="btn btn-previous flex items-center rounded-full cursor-pointer justify-center" @click="next">
            <Right :size="20" />
          </div>
        </div>
      </div>
      <div class="flex justify-around px-2 text-xs opacity-70">
        <div v-for="item in weekKeyPath" :key="`week-key-${item}`" v-t="item" />
      </div>
      <AlmanacInfo v-model="showDetail" :solar="selectedSolar" :almanac="selectedAlmanac" />
      <div class="flex flex-col h-full justify-around px-2">
        <div v-for="week in weeks" :key="`week-${week.getIndex()}`" class="flex w-full justify-around">
          <div
            v-for="day in week.getDays()" :key="day.getDay()" class="flex w-full flex-col items-center content-center"
            :class="{ 'opacity-40': day.getMonth() != currentMonthIndex + 1 }"
          >
            <CalendarDay :day="day" :almanac="findAlmanac(day)" @click="show(day)" />
          </div>
        </div>
      </div>
    </div>
  </widget-wrapper>
</template>

<style lang="scss">
.root {
  color: var(--widget-color);
  height: 100%;
}

.btn-group {
  div:hover {
    background-color: rgba(0, 0, 0, 0.35);
    color: white;
  }

  .btn {
    width: 28px;
    height: 28px;
  }
}
</style>
