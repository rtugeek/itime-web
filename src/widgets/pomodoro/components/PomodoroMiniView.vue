<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePomodoroStore } from '@/stores/usePomodoroStore'

const pomodoro = usePomodoroStore()
const { remindText, status } = storeToRefs(pomodoro)
</script>

<template>
  <div class="mini" :class="{ [status]: true }">
    <span>{{ remindText }}</span>
  </div>
</template>

<style scoped lang="scss">
.mini{
  width: 100vw;
  height: 100vh;
  font-size: 12px;
  color: white;
  overflow: hidden;
  background-color: rgba(255, 115, 0, 0.5);
  position: absolute;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  &.waiting{
    background-color: rgba(0, 183, 255, 0.5);
  }
}
</style>
