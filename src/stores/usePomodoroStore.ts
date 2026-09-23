import { useEventListener, useIntervalFn, useNow, useStorage } from '@vueuse/core'
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

function phaseElapsedMs(phaseStartAt: string | undefined): number {
  if (!phaseStartAt) { return 0 }
  const start = new Date(phaseStartAt).getTime()
  const delta = Date.now() - start
  return delta > 0 ? delta : 0
}

function snapshotPhaseToSnapshot(model: PomodoroModel) {
  if (!model.phaseStartAt) { return }
  const elapsedSec = Math.floor(phaseElapsedMs(model.phaseStartAt) / 1000)
  if (model.status === 'running' && elapsedSec > 0) {
    model.duration += elapsedSec
  }
  else if (model.status === 'resting' && elapsedSec > 0) {
    model.restDuration += elapsedSec
  }
  model.phaseStartAt = undefined
}

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
    phaseStartAt: undefined,
  })

  const settings = useStorage<PomodoroSettings>(AppConfig.KEY_POMODORO_SETTINGS, getDefaultPomodoroSettings(), undefined, { mergeDefaults: true })
  const currentSceneId = useStorage<string>(AppConfig.KEY_POMODORO_USING_SCENE, '')
  const status = computed(() => model.value.status)
  const tickNow = useNow({ interval: 1000 })
  const shortBreakDuration = computed(() => settings.value.shortBreakTime * 60)
  const userStore = useUserStore()
  const historySyncing = ref(false)
  const sceneSyncing = ref(false)

  const effectiveDuration = computed(() => {
    void tickNow.value
    if (model.value.status === 'running') {
      const elapsedSec = Math.floor(phaseElapsedMs(model.value.phaseStartAt) / 1000)
      return model.value.duration + elapsedSec
    }
    return model.value.duration
  })

  const effectiveRestDuration = computed(() => {
    void tickNow.value
    if (model.value.status === 'resting') {
      const elapsedSec = Math.floor(phaseElapsedMs(model.value.phaseStartAt) / 1000)
      return model.value.restDuration + elapsedSec
    }
    return model.value.restDuration
  })

  const remindText = computed(() => {
    if (status.value == 'resting') {
      return dayjs.duration(settings.value.shortBreakTime, 'minute').subtract(effectiveRestDuration.value, 'seconds').format('mm:ss')
    }
    return dayjs.duration(settings.value.pomoTime, 'minute').subtract(effectiveDuration.value, 'seconds').format('mm:ss')
  })

  function reset() {
    const now = new Date()
    model.value = {
      status: 'stop',
      restDuration: 0,
      startAt: now.toISOString(),
      finishAt: now.toISOString(),
      duration: 0,
      phaseStartAt: undefined,
      createAt: undefined,
    }
  }

  const isRunning = computed(() => model.value.status === 'running')
  const progress = computed(() => {
    if (status.value == 'waiting') {
      return 100
    }
    if (status.value == 'resting') {
      const remain = Math.max(0, shortBreakDuration.value - effectiveRestDuration.value)
      return Math.round(remain / shortBreakDuration.value * 100)
    }
    const remain = Math.max(0, totalDuration.value - effectiveDuration.value)
    return Math.round(remain / totalDuration.value * 100)
  })

  const totalDuration = computed(() => settings.value.pomoTime * 60)

  useIntervalFn(() => {
    if (model.value.status === 'running') {
      if (effectiveDuration.value >= totalDuration.value) {
        snapshotPhaseToSnapshot(model.value)
        model.value.status = 'waiting'
      }
    }
    else if (model.value.status === 'resting') {
      if (effectiveRestDuration.value >= settings.value.shortBreakTime * 60) {
        if (settings.value.isAutoNext) {
          start()
        }
        else {
          stop()
        }
      }
    }
  }, 1000, { immediate: true })

  function start() {
    if (model.value.status != 'pause') {
      const now = new Date()
      model.value.duration = 0
      model.value.restDuration = 0
      model.value.startAt = now.toISOString()
      model.value.finishAt = undefined
      model.value.phaseStartAt = now.toISOString()
    }
    else {
      if (!model.value.phaseStartAt) {
        model.value.phaseStartAt = new Date().toISOString()
      }
    }
    model.value.status = 'running'
  }

  function stop() {
    if (model.value.status === 'resting') {
      reset()
      return
    }
    const finalDuration = effectiveDuration.value
    snapshotPhaseToSnapshot(model.value)
    if (finalDuration < 60) {
      NotificationApi.warning('专注时间少于1分钟，不作记录')
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
            duration: finalDuration,
            finishTime: nowISO,
            startTime: startAtStr,
            id: time,
          })
          if (!scene.duration) {
            scene.duration = 0
          }
          scene.duration += finalDuration
          saveScene(scene)
        }
      })

      model.value.status = 'resting'
      model.value.restDuration = 0
      model.value.phaseStartAt = now.toISOString()
    }
  }

  function pause() {
    if (model.value.status === 'running' || model.value.status === 'resting') {
      snapshotPhaseToSnapshot(model.value)
    }
    model.value.status = 'pause'
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
          .filter(item => !item.deleteTime)
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
    return PomodoroHistoryRepository.findBySceneId(sceneId)
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
