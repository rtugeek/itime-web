<script lang="ts" setup>
import { SolarMonth } from 'lunar-typescript'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { ref } from 'vue'
import { useWidget } from '@widget-js/vue3'
import { WidgetData } from '@widget-js/core'
import { Left, Right } from '@icon-park/vue-next'
import CalendarDay from '@/widgets/calendar/CalendarDay.vue'

dayjs.extend(weekOfYear)
const now = dayjs()
const currentMonth = ref(now.month() + 1)
const solarMonth = SolarMonth.fromYm(now.year(), now.month() + 1)
const weeks = ref(solarMonth.getWeeks(0))
useWidget(WidgetData)
</script>

<template>
  <widget-wrapper>
    <div class="root flex flex-col">
      <div class="flex items-baseline gap-2 py-3 px-4">
        <div class="text-xl font-bold">
          {{ now.format('YYYY年MM月') }}
        </div>
        <div class="text-xs">
          第{{ now.week() }}周
        </div>
        <div class="ml-auto">
          <Left />
          <Right />
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
            :class="{ 'opacity-40': day.getMonth() != currentMonth }"
          >
            <CalendarDay :day="day" />
          </div>
        </div>
      </div>
    </div>
  </widget-wrapper>
</template>

<style lang="scss">
body{
  background-color: transparent;
}

.root{
  border-radius: var(--widget-border-radius);
  font-size: 16px;
  background-color:#fff;
}
</style>
