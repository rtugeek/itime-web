<script setup lang="ts">
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import type { PomodoroScene } from '@/data/PomodoroScene'
import { usePomodoroSceneStore } from '@/stores/pomodoroSceneStore'

const router = useRouter()
const pomodoroSceneStore = usePomodoroSceneStore()
const { scenes } = storeToRefs(pomodoroSceneStore)
function goEdit(scene: PomodoroScene) {
  router.push({ name: 'AddPomodoroSceneView', query: { id: scene.id } })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-for="scene in scenes" :key="scene.id" class="scene" @click="goEdit(scene)">
      <div class="flex gap-2">
        <div>{{ scene.icon }}</div>
        <div>{{ scene.name }}</div>
      </div>
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
