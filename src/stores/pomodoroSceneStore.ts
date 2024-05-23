import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { PomodoroScene } from '@/data/PomodoroScene'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'

export const usePomodoroSceneStore = defineStore('pomodoroSceneStore', () => {
  const scenes = ref<PomodoroScene[]>([])

  async function reload() {
    const res = await PomodoroSceneRepository.all()
    scenes.value = res
  }

  return {
    scenes,
    reload,
  }
})
