<script setup lang="ts">
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import type { PomodoroScene } from '@/data/PomodoroScene'
import { usePomodoroStore } from '@/stores/usePomodoroStore'
import PomodoroSceneItem from '@/widgets/pomodoro/components/PomodoroSceneItem.vue'

const router = useRouter()
const pomodoroStore = usePomodoroStore()
const { scenes } = storeToRefs(pomodoroStore)
function goDetail(scene: PomodoroScene) {
  router.push({ name: 'PomodoroDetail', query: { id: scene.id } })
}
pomodoroStore.loadScenes()
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div v-for="scene in scenes" :key="scene.id" class="scene flex" @click="goDetail(scene)">
      <PomodoroSceneItem :scene="scene" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.scene {
  background-color: white;
  border-radius: 5px;
  cursor: pointer;
  padding: 16px 8px;
  &:hover {
    background-color: #f0f0f0;
  }
}
</style>
