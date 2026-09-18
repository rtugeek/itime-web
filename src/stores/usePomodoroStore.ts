import { useEventListener, useIntervalFn, useStorage } from '@vueuse/core'
import { computed, ref, toRaw, watch } from 'vue'
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
import type { IPomodoroScene } from '@/data/PomodoroScene'
import { UserDataSync } from '@/data/sync/UserDataSync'
import { useUserStore } from '@/stores/useUserStore'
import { pomodoroSyncRevision } from '@/data/sync/PomodoroSnapshotSync'
import { usePomodoroBroadcast } from '@/common/broadcast/usePomodoroBroadcast'

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

  const settings = useStorage<PomodoroSettings>(AppConfig.KEY_POMODORO_SETTINGS, getDefaultPomodoroSettings(), undefined, { mergeDefaults: true })
  const currentSceneId = useStorage<string>(AppConfig.KEY_POMODORO_USING_SCENE, '')
  const status = computed(() => model.value.status)
  const duration = computed(() => model.value.duration)
  const shortBreakDuration = computed(() => settings.value.shortBreakTime * 60)
  const userStore = useUserStore()
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
    pomodoroInterval.pause()
    resetInterval.pause()
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
      PomodoroSceneRepository.get(currentSceneId.value).then((scene) => {
        if (scene) {
          saveHistory({
            sceneId: scene.id!,
            duration: model.value.duration,
            finishTime: nowISO,
            startTime: startAtStr,
            id: time,
          })
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
    resetInterval.pause()
  }

  if (isRunning.value) {
    pomodoroInterval.pause()
    resetInterval.pause()
    pomodoroInterval.resume()
  }
  else if (status.value == 'resting') {
    pomodoroInterval.pause()
    resetInterval.pause()
    resetInterval.resume()
  }
  // #endregion

  // #region Scenes Management
  const scenes = ref<IPomodoroScene[]>([])
  const dataRevision = ref(0)
  let loadScenesPromise: Promise<void> | undefined
  const currentScene = computed(() => {
    const scene = scenes.value.find(it => it.id == currentSceneId.value)!
    if (scene) {
      return scene
    }
    else if (scenes.value.length > 0) {
      currentSceneId.value = String(scenes.value[0].id)
      return scenes.value[0]
    }
  })

  async function loadScenes() {
    if (loadScenesPromise) { return loadScenesPromise }
    loadScenesPromise = (async () => {
      try {
        const list = (await PomodoroSceneRepository.all())
          .filter(item => !item.deleteTime && (!item.userId || Number(item.userId) === 0 || Number(item.userId) === userStore.userId))
        list.sort((a, b) => {
          const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
          if (orderDiff !== 0) { return orderDiff }
          return (a.createTime?.getTime() ?? 0) - (b.createTime?.getTime() ?? 0)
        })
        scenes.value = list
      }
      finally {
        loadScenesPromise = undefined
      }
    })()
    return loadScenesPromise
  }

  async function syncScenes() {
    if (userStore.isLogin) {
      sceneSyncing.value = true
      try {
        await UserDataSync.sync()
        await loadScenes()
      }
      finally {
        sceneSyncing.value = false
      }
    }
  }

  async function findSceneById(sceneId: string | number): Promise<IPomodoroScene | null> {
    return PomodoroSceneRepository.get(sceneId)
  }

  const saveScene = async function save(scene: IPomodoroScene) {
    scene.needSync = true
    await PomodoroSceneRepository.save(toRaw(scene))
    await loadScenes()
    dataRevision.value++
    postEvent({ type: 'save', id: scene.id! })
    await syncScenes()
  }

  const saveAllScenes = async (scenesToSave: IPomodoroScene[]) => {
    for (let i = 0; i < scenesToSave.length; i++) {
      scenesToSave[i].sortOrder = i
    }
    const saved = await PomodoroSceneRepository.saveAll(scenesToSave.map(toRaw))
    scenes.value = saved
    dataRevision.value++
    postEvent({ type: 'save-all', time: Date.now() })
    UserDataSync.sync()
    return saved
  }

  async function deleteScene(id: string | number) {
    const scene = await PomodoroSceneRepository.get(id)
    if (scene) {
      await PomodoroSceneRepository.softRemove(scene)
      if (scene.id) {
        await PomodoroHistoryRepository.removeBySceneId(scene.id)
      }
    }

    await loadScenes()
    if (currentSceneId.value == id) {
      if (scenes.value.length > 0) {
        currentSceneId.value = String(scenes.value[0].id)
      }
      else {
        currentSceneId.value = ''
      }
    }
    postEvent({ type: 'delete', id })
    await sync()
  }

  const { postEvent } = usePomodoroBroadcast({
    onChanged: () => { void loadScenes() },
  })
  // #endregion

  // #region History Management
  async function syncHistory() {
    if (userStore.isLogin) {
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
    dataRevision.value++
    postEvent({ type: 'save', id: history.sceneId })
    await syncHistory()
  }

  async function deleteHistory(history: PomodoroHistory) {
    await PomodoroHistoryRepository.softRemove(history)
    dataRevision.value++
    postEvent({ type: 'save', id: history.sceneId })
    await syncHistory()
  }

  async function findHistoryBySceneId(sceneId: number | string): Promise<PomodoroHistory[]> {
    return PomodoroHistoryRepository.findBySceneId(sceneId, userStore.userId)
  }
  // #endregion

  // #region Global Sync & Init
  const syncing = computed(() => historySyncing.value || sceneSyncing.value || UserDataSync.busy.value || PomodoroHistorySync.busy.value)

  async function sync() {
    await syncHistory()
    await loadScenes()
  }

  watch([pomodoroSyncRevision, UserDataSync.revision], () => {
    void loadScenes()
    dataRevision.value++
    postEvent({ type: 'sync', id: '' })
  })
  watch(() => userStore.userId, () => {
    scenes.value = []
    void loadScenes()
    dataRevision.value++
  }, { flush: 'sync' })
  useIntervalFn(() => { void sync() }, 5 * 60 * 1000)
  useEventListener(window, 'online', () => { void sync() })
  void loadScenes().then(sync)
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
    dataRevision,
    syncError: computed(() => UserDataSync.error.value || PomodoroHistorySync.error.value),

    // Scenes
    scenes,
    currentScene,
    loadScenes,
    findSceneById,
    saveScene,
    saveAllScenes,
    deleteScene,

    // History
    findHistoryBySceneId,
    deleteHistory,
    saveHistory,
  }
})
