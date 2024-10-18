import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useBroadcastChannel, useStorage } from '@vueuse/core'
import type { PomodoroScene } from '@/data/PomodoroScene'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'
import { AppConfig } from '@/common/AppConfig'
import { useUserStore } from '@/stores/useUserStore'
import { PomodoroSceneApi } from '@/api/PomodoroSceneApi'

export const usePomodoroSceneStore = defineStore('pomodoroSceneStore', () => {
  const scenes = ref<PomodoroScene[]>([])
  const currentSceneId = useStorage(AppConfig.KEY_POMODORO_USING_SCENE, '1')
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

  async function reload() {
    const res = await PomodoroSceneRepository.all()
    for (const scene of res) {
      if (typeof scene.id == 'string') {
        await PomodoroSceneRepository.remove(scene.id)
        scene.id = new Date().getTime() + Math.ceil(Math.random() * 1000)
        await PomodoroSceneRepository.save(scene)
      }
      if (!scene.icon) {
        await PomodoroSceneRepository.remove(scene.id)
      }
      if (userStore.isLogin) {
        if (!scene.tableId) {
          PomodoroSceneApi.save(scene)
            .then((result) => {
              scene.tableId = result.tableId
              PomodoroSceneRepository.save(scene)
            }).catch()
        }
      }
    }
    if (userStore.isLogin) {
      PomodoroSceneApi.find().then(async (result) => {
        for (const datum of result.data) {
          const localHis = await PomodoroSceneRepository.get(datum.tableId)
          if (localHis) {
            if (localHis.updateTime?.getTime() < datum.updateTime?.getTime()) {
              await PomodoroSceneRepository.save(datum)
            }
          }
          else {
            await PomodoroSceneRepository.save(datum)
          }
        }
      }).catch()
    }
    scenes.value = res
  }

  const { post, data } = useBroadcastChannel({ name: 'pomodoroSceneStore' })
  watch(data, () => {
    reload()
  })

  async function findById(sceneId: number): Promise<PomodoroScene | undefined> {
    return await PomodoroSceneRepository.get(sceneId)
  }

  const save = async function save(scene: PomodoroScene) {
    await PomodoroSceneRepository.save(scene)
    if (userStore.isLogin) {
      PomodoroSceneApi.save(scene).catch()
    }
  }

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
    findById,
    currentScene,
    save,
    deleteScene,
    currentSceneId,
  }
})
