import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createPinia, defineStore, setActivePinia } from 'pinia'
import { computed, nextTick, ref } from 'vue'
import { BrowserWindowApi } from '@widget-js/core'
import { usePomodoroStore } from '@/stores/usePomodoroStore'
import { usePomodoroWindowStateStore } from '@/widgets/pomodoro/usePomodoroWindowStateStore'

const state = vi.hoisted(() => ({
  initialStatus: 'running',
  bounds: { x: 800, y: 890, width: 150, height: 150 },
}))

vi.mock('@/stores/usePomodoroStore', () => ({
  usePomodoroStore: defineStore('mockPomodoro', () => {
    const model = ref({ status: state.initialStatus })
    return { model, status: computed(() => model.value.status) }
  }),
}))
vi.mock('@widget-js/core', () => ({
  BrowserWindowApi: {
    getBounds: vi.fn(async () => ({ ...state.bounds })),
    setBounds: vi.fn(async (bounds) => { Object.assign(state.bounds, bounds) }),
    show: vi.fn(async () => {}),
    setAlwaysOnTop: vi.fn(async () => {}),
    isDraggingWindow: vi.fn(async () => false),
  },
  DeviceApi: {
    getDisplayNearestPoint: vi.fn(async () => ({ workArea: { x: 0, y: 0, width: 1920, height: 1040 } })),
  },
}))

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  state.initialStatus = 'running'
  state.bounds = { x: 800, y: 890, width: 150, height: 150 }
  setActivePinia(createPinia())
})
afterEach(() => vi.useRealTimers())

it.each(['stop', 'running'] as const)('休息结束进入 %s 时会从贴边弹出', async (nextStatus) => {
  state.initialStatus = 'resting'
  const timer = usePomodoroStore()
  const { stickScreenEdge: window } = usePomodoroWindowStateStore()
  window.startHideWindow()
  await vi.advanceTimersByTimeAsync(2300)
  expect(state.bounds.y).toBe(1034)

  timer.model.status = nextStatus
  await nextTick()
  await vi.advanceTimersByTimeAsync(300)
  expect(BrowserWindowApi.show).toHaveBeenCalled()
  expect(BrowserWindowApi.setAlwaysOnTop).toHaveBeenCalledWith(true)
  expect(window.isShowed).toBe(true)
  expect(state.bounds.y).toBe(890)

  if (nextStatus === 'stop') {
    await vi.advanceTimersByTimeAsync(3000)
    expect(window.isShowed).toBe(true)
    window.startHideWindow()
  }
  await vi.advanceTimersByTimeAsync(2300)
  expect(state.bounds.y).toBe(1034)
  window.dispose()
})

it('倒计时结束后弹出，鼠标离开也保持显示，确认后恢复自动隐藏', async () => {
  const timer = usePomodoroStore()
  const { stickScreenEdge: window } = usePomodoroWindowStateStore()
  window.startHideWindow()
  await vi.advanceTimersByTimeAsync(2300)
  expect(state.bounds.y).toBe(1034)

  timer.model.status = 'waiting'
  await nextTick()
  await vi.advanceTimersByTimeAsync(300)
  expect(BrowserWindowApi.show).toHaveBeenCalled()
  expect(BrowserWindowApi.setAlwaysOnTop).toHaveBeenCalledWith(true)
  expect(state.bounds.y).toBe(890)

  window.startHideWindow()
  await vi.advanceTimersByTimeAsync(3000)
  expect(window.isShowed).toBe(true)
  expect(state.bounds.y).toBe(890)

  timer.model.status = 'resting'
  await nextTick()
  window.startHideWindow()
  await vi.advanceTimersByTimeAsync(2300)
  expect(state.bounds.y).toBe(1034)
  window.dispose()
})

it('加载时已结束也会显示窗口，初始化隐藏请求不会盖过提醒', async () => {
  state.initialStatus = 'waiting'
  const { stickScreenEdge: window } = usePomodoroWindowStateStore()
  await vi.advanceTimersByTimeAsync(300)
  expect(BrowserWindowApi.show).toHaveBeenCalledOnce()
  await window.resetPosition()
  window.startHideWindow()
  await vi.advanceTimersByTimeAsync(3000)
  expect(window.isShowed).toBe(true)
  expect(state.bounds.y).toBe(890)
  window.dispose()
})

it('结束提醒会中断正在进行的缩回动画', async () => {
  const timer = usePomodoroStore()
  const { stickScreenEdge: window } = usePomodoroWindowStateStore()
  window.startHideWindow()
  await vi.advanceTimersByTimeAsync(2080)
  expect(state.bounds.y).toBeGreaterThan(890)
  expect(state.bounds.y).toBeLessThan(1034)
  timer.model.status = 'waiting'
  await nextTick()
  await vi.advanceTimersByTimeAsync(1000)
  expect(window.isShowed).toBe(true)
  expect(state.bounds.y).toBe(890)
  window.dispose()
})
