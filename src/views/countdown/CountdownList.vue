<script setup lang="ts">
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCountdownEventStore } from '@/stores/useCountdownEventStore'
import CountdownItem from '@/views/countdown/CountdownItem.vue'

const router = useRouter()
const countdownEventStore = useCountdownEventStore()
const { events } = storeToRefs(countdownEventStore)
function goAdd() {
  router.push({ name: 'CountdownAdd' })
}
</script>

<template>
  <div class="flex h-full ">
    <div class="content w-full flex flex-col">
      <CountdownItem v-for="event in events" :key="event.id" :event="event" />
    </div>
    <div class="pos-absolute right-6 bottom-18">
      <floating-action-button @click="goAdd" />
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
