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
    type: Object as PropType<Almanac>,
  },
})

const isToday = computed<boolean>(() => {
  const todaySolar = Solar.fromDate(new Date())
  return props.day.getYear() === todaySolar.getYear() && props.day.getMonth() === todaySolar.getMonth() && props.day.getDay() === todaySolar.getDay()
})

const festivals = computed(() => {
  return props.day.getFestivals()
})

const bottomText = computed(() => {
  if (festivals.value.length > 0) {
    const festivalName = festivals.value[0]
    if (festivalName.length <= 6) {
      return festivalName
    }
  }
  return props.almanac?.term ?? ''
})
</script>

<template>
  <div
    class="calendar-day flex flex-col items-center relative content-center rounded-full size-11"
    :class="{
      today: isToday,
    }"
  >
    <div class="font-bold">
      {{ day.getDay() }}
    </div>
    <div style="font-size: 10px" class="text-xs text-center" :class="{ today: isToday }">
      <span v-if="bottomText" class="bottom-text">
        {{ bottomText }}
      </span>
      <span v-else class="calendar-lunar">
        {{ day.getLunar().getDayInChinese() }}
      </span>
    </div>
    <div v-if="almanac?.status" class="top-right" :class="{ work: almanac?.status == 2 }">
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
  cursor: pointer;

  &:hover {
    background-color: color-mix(in srgb, var(--widget-primary-color) 100%, transparent 50%);
  }

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

  .bottom-text {
    color: var(--widget-primary-color);
  }
  .today{
    .bottom-text{
      color:var(--widget-color);
    }
  }

}
</style>
