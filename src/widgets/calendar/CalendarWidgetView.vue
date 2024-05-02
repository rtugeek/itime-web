<script lang="ts" setup>
import { SolarMonth } from 'lunar-typescript'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { ref } from 'vue'
import { useWidget } from '@widget-js/vue3'
import { WidgetData } from '@widget-js/core'

dayjs.extend(weekOfYear)
const now = dayjs()
const solarMonth = SolarMonth.fromYm(now.year(), now.month() + 1)
const weeks = ref(solarMonth.getWeeks(1))
useWidget(WidgetData)
</script>

<template>
  <widget-wrapper>
    <div class="root flex flex-col">
      <div class="header">
        <div class="month">
          {{ now.format('YYYY年MM月') }}
        </div>
        <div class="weekOfYear">
          第{{ now.week() }}周
        </div>
      </div>
      <div class="weekday flex w-full justify-around">
        <div>周日</div>
        <div>周一</div>
        <div>周二</div>
        <div>周三</div>
        <div>周四</div>
        <div>周五</div>
        <div>周六</div>
      </div>
      <div class="flex flex-col h-full justify-around">
        <div v-for="week in weeks" :key="`week-${week.getIndex()}`" class="flex w-full justify-around">
          <div v-for="day in week.getDays()" :key="day.getDay()" class="flex w-full flex-col items-center content-center">
            {{ day.getDay() }}
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
