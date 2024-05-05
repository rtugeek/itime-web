<script lang="ts" setup>
import { SolarMonth } from 'lunar-typescript'
import dayjs from 'dayjs'
import { ref } from 'vue'
import { useWidget } from '@widget-js/vue3'
import { WidgetData } from '@widget-js/core'
import { Left, Right } from '@icon-park/vue-next'
import CalendarDay from '@/widgets/calendar/CalendarDay.vue'

const today = dayjs()
const currentMonth = ref(dayjs())
const currentMonthIndex = ref(today.month())
const solarMonth = ref(SolarMonth.fromYm(today.year(), today.month() + 1))
const weeks = ref(solarMonth.value.getWeeks(0))
useWidget(WidgetData)

const next = ()=>{
  solarMonth.value = solarMonth.value.next(1)
  weeks.value = solarMonth.value.getWeeks(0)
  currentMonth.value = currentMonth.value.add(1,'month')
  currentMonthIndex.value = currentMonth.value.month()
}

const previous = ()=>{
  solarMonth.value =  solarMonth.value.next(-1)
  weeks.value = solarMonth.value.getWeeks(0)
  currentMonth.value = currentMonth.value.subtract(1,'month')
  currentMonthIndex.value = currentMonth.value.month()
}
</script>

<template>
  <widget-wrapper>
    <div class="root flex flex-col">
      <div class="flex items-baseline gap-2 py-3 px-4">
        <div class="text-xl font-bold">
          {{ currentMonth.format('YYYY年MM月') }}
        </div>
        <div class="text-xs" v-if="currentMonthIndex == today.month()">
          第{{ currentMonth.isoWeek() }}周
        </div>
        <div class="ml-auto flex gap-1 btn-group text-center">
          <div class="btn-next flex items-center rounded-full size-7 cursor-pointer justify-center" @click="previous">
            <Left :size="20"/>
          </div>
          <div class="btn-previous flex items-center rounded-full size-7 cursor-pointer justify-center" @click="next">
            <Right :size="20"/>
          </div>
        </div>
      </div>
      <div class="flex justify-around px-2 text-xs opacity-70">
        <div>日</div>
        <div>一</div>
        <div>二</div>
        <div>三</div>
        <div>四</div>
        <div>五</div>
        <div>六</div>
      </div>
      <div class="flex flex-col h-full justify-around px-2">
        <div v-for="week in weeks" :key="`week-${week.getIndex()}`" class="flex w-full justify-around">
          <div
            v-for="day in week.getDays()" :key="day.getDay()" class="flex w-full flex-col items-center content-center"
            :class="{ 'opacity-40': day.getMonth() != currentMonthIndex + 1 }"
          >
            <CalendarDay :day="day" />
          </div>
        </div>
      </div>
    </div>
  </widget-wrapper>
</template>

<style lang="scss">
html{
  font-size: var(--widget-font-size);
}
body{
  background-color: transparent;
}

.root{
  color: var(--widget-color);
  border-radius: var(--widget-border-radius);
  background-color:var(--widget-background-color);
}

.btn-group{
  div:hover{
    background-color: rgba(0, 0, 0, 0.35);
    color:white;
  }
}
</style>
