<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import ProgressBar from '@/components/ProgressBar.vue'
import { usePomodoroStore } from '@/stores/usePomodoroStore'
import { usePomodoroWindowStateStore } from '@/widgets/pomodoro/usePomodoroWindowStateStore'

const pomodoro = usePomodoroStore()
const pomodoroWindowState = usePomodoroWindowStateStore()
const { stickEdge, isShowed } = storeToRefs(pomodoroWindowState)
const { status } = storeToRefs(pomodoro)
const color = computed(() => {
  if (status.value == 'running') {
    return 'rgb(255, 170, 0)'
  }
  else if (status.value == 'waiting') {
    return 'rgb(0, 119, 255)'
  }
  else if (status.value == 'pause') {
    return 'rgb(106,0,255)'
  }
  else {
    return 'rgb(0,255,111)'
  }
})

const position = computed(() => {
  if (stickEdge.value == 'top') {
    return 'bottom'
  }
  else if (stickEdge.value == 'right') {
    return 'left'
  }
  else if (stickEdge.value == 'bottom') {
    return 'top'
  }
  else {
    return 'right'
  }
})

const isVertical = computed(() => {
  return stickEdge.value == 'right' || stickEdge.value == 'left'
})

const isShow = computed(() => {
  return !isShowed.value && (status.value == 'running' || status.value == 'pause' || status.value == 'waiting' || status.value == 'resting')
})
</script>

<template>
  <div v-show="isShow">
    <div class="progress" :class="{ [position]: true }">
      <ProgressBar :progress="pomodoro.progress" :color="color" :vertical="isVertical" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.progress{
  position: absolute;
  &.bottom{
    bottom: 0;
    left: 0;
    right: 0;
  }

  &.left{
    top: 0;
    bottom: 0;
    left: 0;
  }

  &.top{
    top: 0;
    left: 0;
    right: 0;
  }

  &.right{
    top: 0;
    bottom: 0;
    right: 0;
  }
}
</style>
