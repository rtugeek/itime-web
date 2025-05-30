import { onMounted, watch } from 'vue'
import { useStickScreenEdge } from '@widget-js/vue3'
import { defineStore, storeToRefs } from 'pinia'

import { BrowserWindowApi, delay } from '@widget-js/core'
import { usePomodoroStore } from '@/stores/usePomodoroStore'

export const usePomodoroWindowStateStore = defineStore('pomodoroWindowStateStore', () => {
  const pomodoroStore = usePomodoroStore()
  const { status } = storeToRefs(pomodoroStore)
  const stickScreenEdge = useStickScreenEdge({ storageKey: 'overlap_page_state', peakSize: 6 })
  watch(status, (value, oldValue) => {
    if (value == 'waiting') {
      stickScreenEdge.showWindow().then(() => {
        BrowserWindowApi.setAlwaysOnTop(true)
      })
    }
    if (oldValue == 'resting' && value == 'running') {
      stickScreenEdge.showWindow().then(() => {
        BrowserWindowApi.setAlwaysOnTop(true)
        stickScreenEdge.startHideWindow()
      })
    }
  })

  BrowserWindowApi.center()
  stickScreenEdge.isAutoHide.value = true
  onMounted(async () => {
    await delay(3000)
    stickScreenEdge.stickToEdge()
  })

  return {
    stickEdge: stickScreenEdge.stickEdge,
    isShowed: stickScreenEdge.isShowed,
  }
})
