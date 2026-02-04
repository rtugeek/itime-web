import { useBroadcastChannel, useIntervalFn, useStorage } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { NotificationApi } from '@widget-js/core'
import type { PomodoroModel } from '@/widgets/pomodoro/PomodoroModel'
import { AppConfig } from '@/common/AppConfig'
import type { PomodoroSettings } from '@/data/PomodoroSettings'
import { getDefaultPomodoroSettings } from '@/data/PomodoroSettings'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'
import type { PomodoroHistory } from '@/data/PomodoroHistory'
import { PomodoroHistorySync } from '@/data/sync/PomodoroHistorySync'
import type { PomodoroScene } from '@/data/PomodoroScene'
import { PomodoroSceneSync } from '@/data/sync/PomodoroSceneSync'
import { useSupabaseStore } from '@/stores/useSupabaseStore'

export const usePomodoroStore = defineStore('pomodoroStore', () => {
  // #region Pomodoro Timer & Settings
  const now = new Date()
  const nowStr = now.toISOString()
  const model = useStorage<PomodoroModel>(AppConfig.KEY_POMODORO, {
    status: 'stop',
    startAt: nowStr,
    finishAt: nowStr,
    duration: 0,
    restDuration: 0,
  })

  const settings = useStorage<PomodoroSettings>(AppConfig.KEY_POMODORO_SETTINGS, getDefaultPomodoroSettings())
  const currentSceneId = useStorage(AppConfig.KEY_POMODORO_USING_SCENE, 1)
  const status = computed(() => model.value.status)
  const duration = computed(() => model.value.duration)
  const shortBreakDuration = computed(() => settings.value.shortBreakTime * 60)
  const supabaseStore = useSupabaseStore()
  const historySyncing = ref(false)
  const sceneSyncing = ref(false)

  const remindText = computed(() => {
    if (status.value == 'resting') {
      return dayjs.duration(settings.value.shortBreakTime, 'minute').subtract(model.value.restDuration, 'seconds').format('mm:ss')
    }
    return dayjs.duration(settings.value.pomoTime, 'minute').subtract(model.value.duration, 'seconds').format('mm:ss')
  })

  function reset() {
    const now = new Date()
    model.value = {
      status: 'stop',
      restDuration: 0,
      startAt: now.toISOString(),
      finishAt: now.toISOString(),
      duration: 0,
      createAt: undefined,
    }
  }

  const isRunning = computed(() => model.value.status === 'running')
  const progress = computed(() => {
    if (status.value == 'waiting') {
      return 100
    }
    if (status.value == 'resting') {
      return Math.round((shortBreakDuration.value - model.value.restDuration) / (shortBreakDuration.value) * 100)
    }
    return Math.round((totalDuration.value - duration.value) / (totalDuration.value) * 100)
  })

  const totalDuration = computed(() => settings.value.pomoTime * 60)

  const pomodoroInterval = useIntervalFn(() => {
    if (model.value.duration >= totalDuration.value) {
      model.value.status = 'waiting'
      pomodoroInterval.pause()
    }
    else {
      model.value.duration++
    }
  }, 1000, { immediate: false })

  const resetInterval = useIntervalFn(() => {
    if (model.value.restDuration == undefined) {
      model.value.restDuration = 0
    }
    if (model.value.restDuration >= settings.value.shortBreakTime * 60) {
      if (settings.value.isAutoNext) {
        start()
      }
      else {
        stop()
      }
      resetInterval.pause()
    }
    else {
      model.value.restDuration++
    }
  }, 1000, { immediate: false })

  function start() {
    if (model.value.status != 'pause') {
      const now = new Date()
      model.value.duration = 0
      model.value.startAt = now.toISOString()
      model.value.finishAt = undefined
    }
    model.value.status = 'running'
    pomodoroInterval.resume()
  }

  function stop() {
    pomodoroInterval.pause()
    resetInterval.pause()
    if (model.value.duration < 60) {
      NotificationApi.warning('专注时间少于1分钟，不作记录')
      reset()
    }
    else if (model.value.status == 'resting') {
      reset()
    }
    else {
      const now = new Date()
      const time = now.getTime()
      const nowISO = now.toISOString()
      model.value.createAt = nowISO
      const startAtStr = typeof model.value.startAt! == 'string' ? model.value.startAt! : (model.value.startAt! as unknown as Date).toISOString()
      saveHistory({
        sceneId: currentSceneId.value,
        duration: model.value.duration,
        finishTime: nowISO,
        startTime: startAtStr,
        id: time,
      })
      PomodoroSceneRepository.get(currentSceneId.value).then((scene) => {
        if (scene) {
          if (!scene.duration) {
            scene.duration = 0
          }
          scene.duration += model.value.duration
          saveScene(scene)
        }
      })

      model.value.status = 'resting'
      model.value.restDuration = 0
      resetInterval.resume()
    }
  }

  function pause() {
    model.value.status = 'pause'
    pomodoroInterval.pause()
  }

  if (isRunning.value) {
    pomodoroInterval.resume()
  }

  if (status.value == 'resting') {
    resetInterval.resume()
  }
  // #endregion

  // #region Scenes Management
  const scenes = ref<PomodoroScene[]>([])
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

  async function loadScenes() {
    scenes.value = await PomodoroSceneRepository.all()
  }

  async function syncScenes() {
    if (supabaseStore.isLogin) {
      sceneSyncing.value = true
      try {
        await PomodoroSceneSync.sync()
        await loadScenes()
      }
      finally {
        sceneSyncing.value = false
      }
    }
  }

  async function findSceneById(sceneId: number): Promise<PomodoroScene | null> {
    return PomodoroSceneRepository.get(sceneId)
  }

  const saveScene = async function save(scene: PomodoroScene) {
    scene.needSync = true
    await PomodoroSceneRepository.save(scene)
    await syncScenes()
  }

  async function deleteScene(id: number) {
    const scene = await PomodoroSceneRepository.get(id)
    if (scene) {
      await PomodoroSceneRepository.softRemove(scene)
    }
    await PomodoroHistoryRepository.removeBySceneId(id)

    await loadScenes()
    if (currentSceneId.value == id) {
      if (scenes.value.length > 0) {
        currentSceneId.value = scenes.value[0].id
      }
      else {
        currentSceneId.value = 0
      }
    }
    post({ type: 'delete', id })
    await sync()
  }

  const { post, data } = useBroadcastChannel({ name: 'pomodoroSceneStore' })
  watch(data, () => {
    loadScenes()
  })
  // #endregion

  // #region History Management
  async function syncHistory() {
    if (supabaseStore.isLogin) {
      historySyncing.value = true
      try {
        await PomodoroHistorySync.sync()
      }
      finally {
        historySyncing.value = false
      }
    }
  }

  async function saveHistory(history: PomodoroHistory) {
    history.needSync = true
    await PomodoroHistoryRepository.save(history)
    await syncHistory()
  }

  async function deleteHistory(history: PomodoroHistory) {
    await PomodoroHistoryRepository.softRemove(history)
    await syncHistory()
  }

  async function findHistoryBySceneId(sceneId: number): Promise<PomodoroHistory[]> {
    return await PomodoroHistoryRepository.findBySceneId(sceneId)
  }
  // #endregion

  // #region Global Sync & Init
  const syncing = computed(() => historySyncing.value || sceneSyncing.value)

  async function sync() {
    await Promise.all([
      syncHistory(),
      syncScenes(),
    ])
  }

  // Initial load
  loadScenes()
  // #endregion

  return {
    // Model & Settings
    model,
    isRunning,
    progress,
    status,
    remindText,
    settings,
    currentSceneId,

    // Actions
    start,
    stop,
    pause,
    reset,

    // Sync
    syncing,
    sync,

    // Scenes
    scenes,
    currentScene,
    loadScenes,
    findSceneById,
    saveScene,
    deleteScene,

    // History
    findHistoryBySceneId,
    deleteHistory,
    saveHistory,
  }
})
