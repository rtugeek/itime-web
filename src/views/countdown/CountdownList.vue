<script setup lang="ts">
import { useRouter } from 'vue-router'
import { nextTick, onMounted, ref } from 'vue'
import BScroll from '@better-scroll/core'
import ScrollBar from '@better-scroll/scroll-bar'
import { storeToRefs } from 'pinia'
import { useCountdownEventStore } from '@/stores/useCountdownEventStore'
import CountdownItem from '@/views/countdown/CountdownItem.vue'

BScroll.use(ScrollBar)
const router = useRouter()
const countdownEventStore = useCountdownEventStore()
const { events } = storeToRefs(countdownEventStore)
const bsWrapper = ref()
function goAdd() {
  router.push({ name: 'CountdownAdd' })
}

onMounted(async () => {
  await nextTick()
  // eslint-disable-next-line no-new
  new BScroll('.bs-wrapper', {
    scrollY: true,
    scrollbar: true,
  })
})
</script>

<template>
  <div class="flex h-full">
    <div ref="bsWrapper" class="bs-wrapper w-full pos-relative overflow-hidden" style="height: calc(100vh - 100px);">
      <div class="content flex flex-col">
        <CountdownItem v-for="event in events" :key="event.id" :event="event" />
      </div>
    </div>
    <div class="pos-absolute right-6 bottom-18">
      <floating-action-button @click="goAdd" />
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
