<script setup lang="ts">
import { type PropType, computed } from 'vue'
import type { CountdownEvent } from '@/data/CountdownEvent'

const props = defineProps({
  event: {
    type: Object as PropType<CountdownEvent>,
    required: true,
  },
})

const countdownText = computed(() => {
  const days = props.event.getCountdownDays()
  const arr: string[] = []
  if (days < 0) {
    arr.push('已经')
  }
  else {
    arr.push('还有')
  }
  arr.push(`${Math.abs(days)}天`)
  return arr.join('')
})
</script>

<template>
  <NutCell>
    <div class="flex w-full items-center">
      <div class="flex flex-col ">
        <div class="name font-bold text-lg">
          {{ event.name }}
        </div>
        <div class="date">
          {{ event.getDateTimeText() }}
        </div>
      </div>
      <div class="countdown ml-auto font-bold text-lg">
        {{ countdownText }}
      </div>
    </div>
  </NutCell>
</template>

<style scoped lang="scss">

</style>
