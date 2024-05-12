import { TransitionPresets, useStorage, useTimeoutFn } from '@vueuse/core'
import { BrowserWindowApi, BrowserWindowApiEvent, Channel, DeployMode, DeviceApi } from '@widget-js/core'
import type { UseMenuOptions } from '@widget-js/vue3'
import { useIpcListener, useMenu, useWidgetParams, useWindowAnimationX, useWindowAnimationY } from '@widget-js/vue3'
import { delay } from '@/utils/TimeUtils'

type StickEdge = 'left' | 'right' | 'top' | 'none'
export function useOverlapMenu(options?: Partial<UseMenuOptions>) {
  const widgetParams = useWidgetParams()
  if (widgetParams.mode == DeployMode.OVERLAP) {
    const alwaysOnTop = useStorage(`overlap_always_top_${widgetParams.id}`, true)
    const overlapStickEdge = useStorage<StickEdge>(`overlap_stick_edge_${widgetParams.id}`, 'none')
    let moved = false
    let isShowed = true
    // 显示在边缘的触发区域大小
    const peakSize = 5
    const animationX = useWindowAnimationX({ duration: 300, transition: TransitionPresets.easeOutCubic, async onFinished() {
    } })
    const animationY = useWindowAnimationY({ duration: 300, transition: TransitionPresets.easeOutCubic, onFinished() {
    } })
    if (alwaysOnTop.value) {
      BrowserWindowApi.setAlwaysOnTop(true)
    }

    useMenu({
      menus: [
        { label: '悬浮设置', id: 'overlap_setting', submenu: [
          { label: '置顶', id: 'overlap_always_top', type: 'checkbox', checked: alwaysOnTop.value },
          { label: '自动贴边', id: 'overlap_stick_to_edge', type: 'checkbox', checked: overlapStickEdge.value != 'none' },
        ] },
        ...options?.menus ?? [],
      ],
      async onMenuCheckChanged(menu, checked) {
        if (menu.id == 'overlap_always_top') {
          BrowserWindowApi.setAlwaysOnTop(checked)
          alwaysOnTop.value = checked
        }
        else if (menu.id == 'overlap_stick_to_edge') {
          if (checked) {
            overlapStickEdge.value = await calcEdge()
            stickToEdge()
            startHideWindow()
          }
          else {
            overlapStickEdge.value = 'none'
          }
        }
        options?.onMenuCheckChanged?.(menu, checked)
      },
      onMenuClick(_menu) {
        options?.onMenuClick?.(_menu)
      },
    })

    const calcEdge = async (): Promise<StickEdge> => {
      const windowBounds = await BrowserWindowApi.getBounds()
      const point = await DeviceApi.getCursorScreenPoint()
      const display = await DeviceApi.getDisplayNearestPoint(point)
      const workArea = display.workArea
      const diffTop = Math.abs(windowBounds.y - workArea.y)
      const diffLeft = Math.abs(windowBounds.x - workArea.x)
      const diffRight = Math.abs(workArea.width - windowBounds.x - windowBounds.width)
      // 从diffTop,diffLeft,diffRight找出最小的进行贴边
      const min = Math.min(diffTop, diffLeft, diffRight)
      if (min == diffRight) {
        return 'right'
      }
      else if (min == diffLeft) {
        return 'left'
      }
      else {
        return 'top'
      }
    }

    const hideWindow = async (edge?: StickEdge) => {
      const windowBounds = await BrowserWindowApi.getBounds()
      const display = await DeviceApi.getDisplayNearestPoint({ x: windowBounds.x, y: windowBounds.y })
      edge = edge ?? overlapStickEdge.value
      if (edge == 'none') {
        return
      }
      if (edge == 'left') {
        await animationX.animate(-windowBounds.width + peakSize)
      }
      else if (edge == 'right') {
        if (windowBounds.y < display.workArea.y) {
          await BrowserWindowApi.setPosition({ y: display.workArea.y })
        }
        await animationX.animate(display.workArea.width - peakSize)
      }
      else {
        const maxX = display.workArea.width - windowBounds.width
        if (windowBounds.x > maxX) {
          await BrowserWindowApi.setPosition({ x: maxX })
        }
        await animationY.animate(display.workArea.y - windowBounds.height + peakSize)
      }
      BrowserWindowApi.blur()
      isShowed = false
    }

    const { start: startHideWindow, stop: stopHideWindow } = useTimeoutFn(hideWindow, 3000)
    const correctPos = async () => {
      const windowBounds = await BrowserWindowApi.getBounds()
      const display = await DeviceApi.getDisplayNearestPoint({ x: windowBounds.x, y: windowBounds.y })
      const workArea = display.workArea
      const maxX = workArea.width - windowBounds.width
      if (windowBounds.x > maxX) {
        await BrowserWindowApi.setPosition({ x: maxX })
      }
      else if (windowBounds.x < workArea.x - windowBounds.width) {
        await BrowserWindowApi.setPosition({ x: workArea.x - windowBounds.width + peakSize })
      }
      const minY = workArea.y - windowBounds.height
      if (windowBounds.y < minY) {
        await BrowserWindowApi.setPosition({ y: minY + peakSize })
      }
    }
    BrowserWindowApi.openDevTools()

    const showWindow = async () => {
      stopHideWindow()
      if (isShowed) {
        return
      }
      isShowed = true
      await stickToEdge()
    }

    const stickToEdge = async () => {
      const windowBounds = await BrowserWindowApi.getBounds()
      const display = await DeviceApi.getDisplayNearestPoint({ x: windowBounds.x, y: windowBounds.y })
      const workArea = display.workArea
      if (overlapStickEdge.value == 'left') {
        animationX.animate(workArea.x)
      }
      else if (overlapStickEdge.value == 'right') {
        animationX.animate(workArea.width - windowBounds.width + peakSize)
      }
      else {
        animationY.animate(workArea.y)
      }
    }

    document.body.addEventListener('mouseenter', async () => {
      showWindow()
    })

    document.body.addEventListener(('mouseleave'), async () => {
      if (overlapStickEdge.value != 'none') {
        if (moved) {
          overlapStickEdge.value = await calcEdge()
          stickToEdge()
          startHideWindow()
          moved = false
        }
        else if (isShowed) {
          startHideWindow()
        }
      }
    })

    if (overlapStickEdge.value != 'none') {
      correctPos()
      delay(1000).then(async () => {
        stickToEdge()
        startHideWindow()
      })
    }

    useIpcListener(Channel.BROWSER_WINDOW, async (event: string) => {
      if (event == BrowserWindowApiEvent.BLUR) {
        if (overlapStickEdge.value) {
          startHideWindow()
        }
      }
      else if (event == BrowserWindowApiEvent.MOVED) {
        moved = true
      }
    })
  }
}
