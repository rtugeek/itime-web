import { watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { BrowserWindowApi, DeviceApi } from '@widget-js/core'
import { usePomodoroStore } from '@/stores/usePomodoroStore'
import { createEdgeWindow } from '@/widgets/pomodoro/edgeWindow'

export const usePomodoroWindowStateStore = defineStore('pomodoroWindowStateStore', () => {
  const pomodoroStore = usePomodoroStore()
  const { status } = storeToRefs(pomodoroStore)
  const stickScreenEdge = createEdgeWindow({
    getBounds: () => BrowserWindowApi.getBounds(),
    getWorkArea: async point => (await DeviceApi.getDisplayNearestPoint(point)).workArea,
    setBounds: bounds => BrowserWindowApi.setBounds(bounds),
    show: () => BrowserWindowApi.show(),
    setAlwaysOnTop: value => BrowserWindowApi.setAlwaysOnTop(value),
    isDraggingWindow: () => BrowserWindowApi.isDraggingWindow(),
  }, 'bottom', 6, () => status.value !== 'waiting')
  watch(status, (value, oldValue) => {
    if (value == 'waiting') {
      stickScreenEdge.showWindow().then(() => {
        BrowserWindowApi.setAlwaysOnTop(true)
      })
    }
    if (oldValue == 'resting' && (value == 'running' || value == 'stop')) {
      stickScreenEdge.showWindow().then(() => {
        BrowserWindowApi.setAlwaysOnTop(true)
        if (value == 'running') {
          stickScreenEdge.startHideWindow()
        }
      })
    }
  }, { immediate: true })

  return {
    stickScreenEdge,
    stickEdge: stickScreenEdge.stickEdge,
    isShowed: stickScreenEdge.isShowed,
  }
})
