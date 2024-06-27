<script setup lang="ts">
import { type PropType, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { CountdownEvent } from '@/data/CountdownEvent'

const props = defineProps({
  event: {
    type: Object as PropType<CountdownEvent>,
    required: true,
  },
})
const router = useRouter()
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

function onClick() {
  router.push({ name: 'CountdownAdd', query: { id: props.event.id } })
}
</script>

<template>
  <NutCell>
    <div class="flex w-full items-center cursor-pointer" @click="onClick">
      <div class="flex flex-col">
        <div class="name font-bold">
          {{ event.name }}
        </div>
        <div class="date">
          {{ event.getDateTimeText() }}
        </div>
      </div>
      <div class="countdown ml-auto font-bold">
        {{ countdownText }}
      </div>
    </div>
  </NutCell>
</template>

<style scoped lang="scss">

</style>
