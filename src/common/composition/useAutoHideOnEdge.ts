import {
  BrowserWindowApi,
  Channel,
  DeviceApi,
  MouseApi,
  MouseApiEvent,
  type Rectangle,
} from '@widget-js/core'
import type { CubicBezierPoints, EasingFunction } from '@vueuse/core'

import { type MaybeRef, type Ref, computed, watchEffect } from 'vue'
import { ref } from 'vue'
import {
  type StickEdge,
  type UseWindowAnimationOptions,
  useIpcListener,
  useWidgetStorage,
  useWindowAnimationX,
  useWindowAnimationY,
} from '@widget-js/vue3'
import consola from 'consola'
import { TransitionPresets } from '@vueuse/core'

export interface UseStickScreenEdgeOptions {
  /**
   * 状态存储
   * @see [useStorage](https://vueuse.org/core/useStorage)
   */
  storageKey: string
  transition?: MaybeRef<EasingFunction | CubicBezierPoints>
}

export interface UseStickScreenEdgeReturn {
  showWindow: (edge?: StickEdge) => Promise<void>
  hideWindow: (edge?: StickEdge) => Promise<void>
  isShowed: Ref<boolean>
  isAutoHide: Ref<boolean>
  correctPosition: () => Promise<void>
  checkHideWindow: () => Promise<void>
  calcEdge: () => Promise<StickEdge>
  stickToEdge: (edge?: StickEdge) => Promise<void>
  stickEdge: Ref<StickEdge>
}

export function useAutoHideOnEdge(options: UseStickScreenEdgeOptions): UseStickScreenEdgeReturn {
  const isShowed = ref(true)
  let latestShowAt = Date.now()
  let latestHideAt = Date.now()
  const animationOption: UseWindowAnimationOptions = {
    transition: TransitionPresets.easeOutCubic,
  }
  const animationX = useWindowAnimationX(animationOption)
  const animationY = useWindowAnimationY(animationOption)
  const animating = computed(() => {
    return animationX.isPlaying.value || animationY.isPlaying.value
  })
  const isAutoHide = useWidgetStorage<boolean>(options.storageKey, false)
  watchEffect(() => {
    if (isAutoHide.value) {
      BrowserWindowApi.setBackgroundThrottling(false)
    }
  })
  const stickEdge = ref<StickEdge>('none')
  const calcEdge = async (): Promise<StickEdge> => {
    const windowBounds = await BrowserWindowApi.getBounds()
    const display = await DeviceApi.getDisplayNearestPoint({ x: windowBounds.x, y: windowBounds.y })
    const workArea = display.workArea
    if (windowBounds.y - workArea.y <= 10) {
      return 'top'
    }
    if (windowBounds.x - workArea.x <= 10) {
      return 'left'
    }
    if (windowBounds.x + windowBounds.width >= workArea.x + workArea.width - 10) {
      return 'right'
    }
    return 'none'
  }

  const correctPosition = async () => {
    const windowBounds = await BrowserWindowApi.getBounds()
    const display = await DeviceApi.getDisplayNearestPoint({ x: windowBounds.x, y: windowBounds.y })
    const workArea = display.workArea
    const maxX = workArea.x + workArea.width - windowBounds.width
    const minX = workArea.x
    const minY = workArea.y
    if (windowBounds.x > maxX) {
      await BrowserWindowApi.setPosition({ x: maxX })
    }
    else if (windowBounds.x < minX) {
      await BrowserWindowApi.setPosition({ x: minX })
    }
    if (windowBounds.y < minY) {
      await BrowserWindowApi.setPosition({ y: minY })
    }
  }
  correctPosition()
  async function createHotspot() {
    const bounds = await BrowserWindowApi.getBounds()
    const display = await DeviceApi.getDisplayNearestPoint({ x: bounds.x, y: bounds.y })
    const workArea = display.workArea
    const scale = display.scaleFactor
    const peakSize = 6
    const rect: Rectangle = { x: 0, y: 0, height: peakSize, width: peakSize }
    if (stickEdge.value === 'left') {
      rect.x = workArea.x
      rect.y = bounds.y
      rect.height = bounds.height
    }
    else if (stickEdge.value === 'right') {
      rect.y = bounds.y
      rect.x = workArea.width - peakSize
      rect.height = bounds.height
    }
    else {
      rect.width = bounds.width
      rect.x = bounds.x
      rect.y = workArea.y
    }
    await MouseApi.createHotspot({
      x: rect.x * scale,
      y: rect.y,
      width: rect.width * scale,
      height: rect.height * scale,
    })
    console.log('createHotSpot', workArea, rect)
  }

  const hideWindow = async (edge?: StickEdge) => {
    stickEdge.value = edge ?? await calcEdge()
    console.log('hideWindow', stickEdge.value)
    if (stickEdge.value == 'none') {
      return
    }
    latestHideAt = Date.now()
    await correctPosition()
    consola.info('hide', stickEdge.value)
    const windowBounds = await BrowserWindowApi.getBounds()
    const display = await DeviceApi.getDisplayNearestPoint({ x: windowBounds.x, y: windowBounds.y })
    const workArea = display.workArea
    if (stickEdge.value === 'left') {
      await animationX.animate(-windowBounds.width + workArea.x)
    }
    else if (stickEdge.value === 'right') {
      await animationX.animate(workArea.width)
    }
    else {
      await animationY.animate(workArea.y - windowBounds.height)
    }
    isShowed.value = false
    createHotspot()
  }

  const stickToEdge = async (edge?: StickEdge) => {
    stickEdge.value = edge ?? await calcEdge()
    const windowBounds = await BrowserWindowApi.getBounds()
    const display = await DeviceApi.getDisplayNearestPoint({ x: windowBounds.x, y: windowBounds.y })
    const workArea = display.workArea
    if (stickEdge.value === 'left') {
      animationX.animate(workArea.x)
    }
    else if (stickEdge.value === 'right') {
      animationX.animate(workArea.width - windowBounds.width)
    }
    else {
      animationY.animate(workArea.y)
    }
  }

  /**
   * 检测窗口是否贴近或者超出屏幕边缘
   */
  async function isOnScreenEdge() {
    const windowBounds = await BrowserWindowApi.getBounds()
    const display = await DeviceApi.getDisplayNearestPoint({ x: windowBounds.x, y: windowBounds.y })
    const workArea = display.workArea
    if (windowBounds.x - workArea.x <= 10
      || (windowBounds.x + windowBounds.width) >= workArea.width - 10
      || windowBounds.y <= workArea.y + 10
      || (windowBounds.y + windowBounds.height) >= workArea.height - 10) {
      return true
    }
    return false
  }

  async function checkHideWindow() {
    if (isAutoHide.value) {
      if (await isOnScreenEdge()) {
        await stickToEdge()
      }
    }
  }

  const showWindow = async () => {
    consola.info('Show Window')
    latestShowAt = Date.now()
    await BrowserWindowApi.show()
    await BrowserWindowApi.setAlwaysOnTop(true)
    isShowed.value = true
    await stickToEdge()
  }

  useIpcListener(Channel.MOUSE, (event) => {
    if (event == MouseApiEvent.HOTSPOT_ACTIVE) {
      if (!isShowed.value && !animating.value && isAutoHide.value && Date.now() - latestHideAt > 500) {
        showWindow()
      }
    }
  })

  document.addEventListener('mouseleave', async () => {
    const onEdge = await isOnScreenEdge()
    if (isAutoHide.value && !animating.value && onEdge) {
      hideWindow()
    }
  })
  checkHideWindow()

  return {
    showWindow,
    hideWindow,
    isAutoHide,
    isShowed,
    correctPosition,
    checkHideWindow,
    calcEdge,
    stickToEdge,
    stickEdge,
  }
}
