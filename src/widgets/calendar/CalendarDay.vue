<script setup lang="ts">
import { Solar } from 'lunar-typescript'
import type { PropType } from 'vue'
import { computed } from 'vue'
import type { Almanac } from '@/api/PublicEventApi'

const props = defineProps({
  day: {
    type: Object as PropType<Solar>,
    required: true,
  },
  almanac: {
    type: Object as PropType<Almanac>
  }
})

const isToday = computed<boolean>(() => {
  const todaySolar = Solar.fromDate(new Date())
  return props.day.getYear() === todaySolar.getYear() && props.day.getMonth() === todaySolar.getMonth() && props.day.getDay() === todaySolar.getDay();
})

const festivals = computed(() => {
  return props.day.getFestivals()
})
</script>

<template>
  <div
    class="calendar-day flex flex-col items-center relative content-center rounded-full  size-10" :class="{
      today: isToday,
    }"
  >
    <div class="font-bold">
      {{ day.getDay() }}
    </div>
    <div style="font-size: 10px" class="text-xs text-center">
      <span v-if="festivals.length > 0" class="festival">
        {{ festivals[0] }}
      </span>
      <span v-else class="calendar-lunar" :class="{ today: !isToday }">
        {{ day.getLunar().getDayInChinese() }}
      </span>
    </div>
    <div v-if="almanac?.status" class="top-right" :class="{work:almanac?.status == 2}">
      <span v-if="almanac?.status == 1">
        休
      </span>
      <span v-if="almanac?.status == 2">
        班
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.calendar-day {
  color: var(--widget-color);

  &.today {
    background-color: var(--widget-primary-color);
    color: white
  }

  .top-right {
    width: 0.8rem;
    position: absolute;
    height: 0.8rem;
    border-radius: 2px;
    text-align: center;
    font-size: 0.6rem;
    background-color: rgba(255, 34, 0, 0.8);
    color: white;
    right: 0;
    top: 0;

    &.work {
      background-color: rgba(255, 145, 0, 0.8);
    }
  }

  .calendar-lunar {
    &:not(.active) {
      opacity: 50;
    }
  }

  .festival {
    color: var(--widget-primary-color);
  }

}
</style>
