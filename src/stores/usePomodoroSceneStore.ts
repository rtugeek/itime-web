import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useBroadcastChannel, useStorage } from '@vueuse/core'
import type { PomodoroScene } from '@/data/PomodoroScene'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'
import { AppConfig } from '@/common/AppConfig'

export const usePomodoroSceneStore = defineStore('pomodoroSceneStore', () => {
  const scenes = ref<PomodoroScene[]>([])
  const currentSceneId = useStorage(AppConfig.KEY_POMODORO_USING_SCENE, '1')
  const currentScene = computed(() => {
    const scene = scenes.value.find(it => it.id == currentSceneId.value)!
    if (scene) {
      return scene
    }
    else if (scenes.value.length > 0) {
      currentSceneId.value = scenes.value[0].id
      return scenes.value[0]
    }
  })

  async function reload() {
    const res = await PomodoroSceneRepository.all()
    scenes.value = res
  }

  const { post, data } = useBroadcastChannel({ name: 'pomodoroSceneStore' })
  watch(data, () => {
    reload()
  })

  async function deleteScene(id: string) {
    await PomodoroSceneRepository.remove(id)
    await reload()
    if (currentSceneId.value == id) {
      if (scenes.value.length > 0) {
        currentSceneId.value = scenes.value[0].id
      }
      else {
        currentSceneId.value = ''
      }
    }
    post({ type: 'delete', id })
  }

  return {
    scenes,
    reload,
    currentScene,
    deleteScene,
    currentSceneId,
  }
})
