import { useIntervalFn, useStorage } from '@vueuse/core'
import { computed } from 'vue'
import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { NotificationApi } from '@widget-js/core'
import type { PomodoroModel } from '@/widgets/pomodoro/PomodoroModel'
import { AppConfig } from '@/common/AppConfig'
import type { PomodoroSettings } from '@/data/PomodoroSettings'
import { getDefaultPomodoroSettings } from '@/data/PomodoroSettings'
import { usePomodoroHistoryStore } from '@/stores/usePomodoroHistoryStore'
import { usePomodoroSceneStore } from '@/stores/usePomodoroSceneStore'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'

export const usePomodoroStore = defineStore('pomodoroStore', () => {
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
  const sceneId = useStorage(AppConfig.KEY_POMODORO_USING_SCENE, 1)
  const status = computed(() => model.value.status)
  const duration = computed(() => model.value.duration)
  const shortBreakDuration = computed(() => settings.value.shortBreakTime * 60)
  const pomodoroHistoryStore = usePomodoroHistoryStore()
  const pomodoroSceneStore = usePomodoroSceneStore()
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
    // model.finishAt = dayjs().add(pomoSettings.pomoTime, 'minute').toDate()
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
      pomodoroHistoryStore.save({
        sceneId: sceneId.value,
        duration: model.value.duration,
        finishTime: nowISO,
        startTime: startAtStr,
        id: time,
      })
      PomodoroSceneRepository.get(sceneId.value).then((scene) => {
        if (scene) {
          if (!scene.duration) {
            scene.duration = 0
          }
          scene.duration += model.value.duration
          pomodoroSceneStore.save(scene)
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

  return {
    model,
    isRunning,
    progress,
    status,
    remindText,
    settings,
    start,
    stop,
    pause,
  }
})
