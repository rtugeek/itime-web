<script setup lang="ts">
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import type { PomodoroScene } from '@/data/PomodoroScene'
import { usePomodoroSceneStore } from '@/stores/usePomodoroSceneStore'

const router = useRouter()
const { t } = useI18n()
const pomodoroSceneStore = usePomodoroSceneStore()
const { scenes } = storeToRefs(pomodoroSceneStore)
function goDetail(scene: PomodoroScene) {
  router.push({ name: 'PomodoroDetail', query: { id: scene.id } })
}
pomodoroSceneStore.reload()
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div v-for="scene in scenes" :key="scene.id" class="scene flex" @click="goDetail(scene)">
      <div class="flex gap-2">
        <div>{{ scene.icon }}</div>
        <div>{{ scene.name }}</div>
      </div>
      <div class="ml-auto">
        {{ Math.round(dayjs.duration(scene.duration ?? 0, 'second').as('minutes')) }}{{ t('minute') }}
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
