import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useBroadcastChannel, useStorage } from '@vueuse/core'
import consola from 'consola'
import type { PomodoroScene } from '@/data/PomodoroScene'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'
import { AppConfig } from '@/common/AppConfig'
import { useUserStore } from '@/stores/useUserStore'
import { PomodoroSceneApi } from '@/api/PomodoroSceneApi'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'
import { PomodoroHistorySync } from '@/data/sync/PomodoroHistorySync'
import { PomodoroSceneSync } from '@/data/sync/PomodoroSceneSync'

export const usePomodoroSceneStore = defineStore('pomodoroSceneStore', () => {
  const scenes = ref<PomodoroScene[]>([])
  const currentSceneId = useStorage(AppConfig.KEY_POMODORO_USING_SCENE, 1)
  const userStore = useUserStore()
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

  if (userStore.isLogin) {
    PomodoroSceneSync.sync().catch(consola.error)
    PomodoroHistorySync.sync().catch(consola.error)
  }

  async function reload() {
    scenes.value = await PomodoroSceneRepository.all()
  }

  const { post, data } = useBroadcastChannel({ name: 'pomodoroSceneStore' })
  watch(data, () => {
    reload()
  })

  async function findById(sceneId: number): Promise<PomodoroScene | null> {
    return PomodoroSceneRepository.get(sceneId)
  }

  const save = async function save(scene: PomodoroScene) {
    await PomodoroSceneRepository.save(scene)
    if (userStore.isLogin) {
      PomodoroSceneApi.save(scene).catch()
    }
  }

  async function deleteScene(id: number) {
    if (userStore.isLogin) {
      await PomodoroSceneApi.delete(id)
    }
    await PomodoroSceneRepository.remove(id)
    await PomodoroHistoryRepository.removeBySceneId(id)

    await reload()
    if (currentSceneId.value == id) {
      if (scenes.value.length > 0) {
        currentSceneId.value = scenes.value[0].id
      }
      else {
        currentSceneId.value = 0
      }
    }
    post({ type: 'delete', id })
  }

  return {
    scenes,
    reload,
    findById,
    currentScene,
    save,
    deleteScene,
    currentSceneId,
  }
})
