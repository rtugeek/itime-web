<script setup lang="ts">
import { Solar } from 'lunar-typescript'
import type { PropType } from 'vue'
import { computed } from 'vue'

const props = defineProps({
  day: {
    type: Object as PropType<Solar>,
    required: true,
  }
})

const isToday = computed(() => {
  const todaySolar = Solar.fromDate(new Date())
  if (props.day.getYear() === todaySolar.getYear() && props.day.getMonth() === todaySolar.getMonth() && props.day.getDay() === todaySolar.getDay()) {
    return true
  }
  return false
})

const festivals = computed(() => {
  return props.day.getFestivals()
})
</script>

<template>
  <div
      class="calendar-day flex flex-col items-center content-center rounded-full  size-10" :class="{
      'today': isToday,
    }"
  >
    <div class="font-bold">
      {{ day.getDay() }}
    </div>
    <div style="font-size: 10px" class="text-xs text-center">
      <span v-if="festivals.length > 0" class="festival">
        {{ festivals[0] }}
      </span>
      <span v-else class="calendar-lunar" :class="{'today':!isToday}">
        {{ day.getLunar().getDayInChinese() }}
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
