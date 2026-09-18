import { afterEach, expect, it, vi } from 'vitest'
import { createEdgeWindow } from '@/widgets/pomodoro/edgeWindow'

afterEach(() => vi.useRealTimers())

async function finishAnimation(action: Promise<void>) {
  await vi.advanceTimersByTimeAsync(300)
  await action
}

it('隐藏和弹出经过中间位置，动画不触发重新吸附', async () => {
  const { window, bounds } = setup()
  window.startHideWindow()
  await vi.advanceTimersByTimeAsync(2080)
  expect(bounds.y).toBeGreaterThan(890)
  expect(bounds.y).toBeLessThan(1034)
  await finishAnimation(window.onMoved())
  await vi.advanceTimersByTimeAsync(220)
  expect(bounds.y).toBe(1034)
  const shown = window.showWindow()
  await vi.advanceTimersByTimeAsync(80)
  expect(bounds.y).toBeGreaterThan(890)
  expect(bounds.y).toBeLessThan(1034)
  await finishAnimation(shown)
  expect(bounds.y).toBe(890)
  expect(bounds.width).toBe(150)
  expect(bounds.height).toBe(150)
})

it('隐藏途中返回，从当前位置反向弹出，不继续滑向屏幕外', async () => {
  const { window, bounds, api } = setup()
  window.startHideWindow()
  await vi.advanceTimersByTimeAsync(2080)
  const interruptedY = bounds.y
  api.setBounds.mockClear()
  await finishAnimation(window.showWindow())
  expect(bounds.y).toBe(890)
  expect(api.setBounds.mock.calls.every(([point]) => point.y <= interruptedY)).toBe(true)
  expect(window.isShowed.value).toBe(true)
})

it('动画中销毁后停止写入位置', async () => {
  const { window, api } = setup()
  window.startHideWindow()
  await vi.advanceTimersByTimeAsync(2080)
  window.dispose()
  const count = api.setBounds.mock.calls.length
  await vi.advanceTimersByTimeAsync(500)
  expect(api.setBounds).toHaveBeenCalledTimes(count)
})

function setup(area = { x: 0, y: 0, width: 1920, height: 1040 }, edge: 'bottom' | 'right' | 'left' | 'top' = 'bottom') {
  vi.useFakeTimers()
  const bounds = { x: area.x + area.width - 150, y: area.y + area.height - 150, width: 150, height: 150 }
  const api = {
    getBounds: vi.fn(async () => ({ ...bounds })),
    getWorkArea: vi.fn(async (point: { x: number, y: number }) => { void point; return area }),
    setBounds: vi.fn(async (point: { x: number, y: number, width: number, height: number }) => {
      expect(point.width).toBe(150)
      expect(point.height).toBe(150)
      Object.assign(bounds, point)
    }),
    show: vi.fn(async () => {}),
    setAlwaysOnTop: vi.fn(async (value: boolean) => { void value }),
    isDraggingWindow: vi.fn(async () => false),
  }
  return { bounds, api, window: createEdgeWindow(api, edge) }
}

it('右下角向下隐藏后，恢复纵坐标且保留底部方向', async () => {
  const { bounds, window } = setup()
  window.startHideWindow()
  await vi.advanceTimersByTimeAsync(2300)
  expect(bounds.y).toBe(1034)
  expect(window.isShowed.value).toBe(false)
  await finishAnimation(window.showWindow())
  expect(bounds).toEqual({ x: 1770, y: 890, width: 150, height: 150 })
  expect(window.stickEdge.value).toBe('bottom')
  expect(window.isShowed.value).toBe(true)
})

it('每次初始化都重置到当前屏幕工作区底部中间', async () => {
  const { window, bounds } = setup({ x: -1920, y: 80, width: 1920, height: 1000 }, 'left')
  await window.resetPosition()
  expect(bounds).toEqual({ x: -1035, y: 930, width: 150, height: 150 })
  expect(window.stickEdge.value).toBe('bottom')
  bounds.x = -1900
  bounds.y = 100
  await finishAnimation(window.onMoved())
  await window.resetPosition()
  expect(bounds).toEqual({ x: -1035, y: 930, width: 150, height: 150 })
})

it.each([
  ['left', 20, 400, 0, 400],
  ['right', 1740, 400, 1770, 400],
  ['top', 700, 20, 700, 0],
  ['bottom', 700, 870, 700, 890],
] as const)('拖动结束后自动吸附到 %s，保留沿边位置', async (edge, x, y, expectedX, expectedY) => {
  const { window, bounds } = setup()
  await window.resetPosition()
  Object.assign(bounds, { x, y })
  const snapped = window.onMoved()
  await vi.advanceTimersByTimeAsync(80)
  const axis = x !== expectedX ? 'x' : 'y'
  const start = axis === 'x' ? x : y
  const end = axis === 'x' ? expectedX : expectedY
  expect(bounds[axis]).toBeGreaterThan(Math.min(start, end))
  expect(bounds[axis]).toBeLessThan(Math.max(start, end))
  await finishAnimation(snapped)
  expect(window.stickEdge.value).toBe(edge)
  expect(bounds.x).toBe(expectedX)
  expect(bounds.y).toBe(expectedY)
})

it('自身隐藏产生的 moved 事件不会触发重新吸附或显示', async () => {
  const { window, api } = setup()
  await window.resetPosition()
  window.startHideWindow()
  await vi.advanceTimersByTimeAsync(2300)
  api.setBounds.mockClear()
  await finishAnimation(window.onMoved())
  expect(api.setBounds).not.toHaveBeenCalled()
  expect(window.isShowed.value).toBe(false)
})

it('拖动期间不隐藏或吸附，结束后才根据新位置吸附', async () => {
  const { window, bounds, api } = setup()
  await window.resetPosition()
  api.setBounds.mockClear()
  api.isDraggingWindow.mockResolvedValue(true)
  Object.assign(bounds, { x: 10, y: 400 })
  window.startHideWindow()
  await vi.advanceTimersByTimeAsync(2300)
  await finishAnimation(window.onMoved())
  expect(api.setBounds).not.toHaveBeenCalled()
  api.isDraggingWindow.mockResolvedValue(false)
  await finishAnimation(window.onMoved())
  expect(bounds.x).toBe(0)
  expect(window.stickEdge.value).toBe('left')
})

it.each(['left', 'right', 'top', 'bottom'] as const)('带负坐标和工作区偏移的副屏：%s 隐藏及恢复', async (edge) => {
  const area = { x: -1920, y: 80, width: 1920, height: 1000 }
  const { bounds, window, api } = setup(area, edge)
  await finishAnimation(window.stickToEdge(edge))
  const visible = { ...bounds }
  window.startHideWindow()
  await vi.advanceTimersByTimeAsync(2300)
  if (edge === 'left') { expect(bounds.x).toBe(-2064) }
  if (edge === 'right') { expect(bounds.x).toBe(-6) }
  if (edge === 'top') { expect(bounds.y).toBe(-64) }
  if (edge === 'bottom') { expect(bounds.y).toBe(1074) }
  await finishAnimation(window.showWindow())
  expect(bounds).toEqual(visible)
  expect(api.getWorkArea).toHaveBeenLastCalledWith({ x: visible.x + 75, y: visible.y + 75 })
})

it('鼠标返回取消隐藏；销毁后不再移动', async () => {
  const { window, api } = setup()
  window.startHideWindow()
  await vi.advanceTimersByTimeAsync(1900)
  await finishAnimation(window.showWindow())
  await vi.advanceTimersByTimeAsync(2100)
  expect(window.isShowed.value).toBe(true)
  expect(api.setBounds).toHaveBeenCalledTimes(1)
  window.startHideWindow()
  window.dispose()
  await vi.advanceTimersByTimeAsync(2300)
  await finishAnimation(window.showWindow())
  expect(api.setBounds).toHaveBeenCalledTimes(1)
})

it('隐藏查询尚未完成时请求显示，不再执行过期隐藏', async () => {
  const { window, api } = setup()
  let release!: (area: { x: number, y: number, width: number, height: number }) => void
  api.getWorkArea.mockImplementationOnce(() => new Promise((resolve) => { release = resolve }))
  window.startHideWindow()
  await vi.advanceTimersByTimeAsync(2300)
  const shown = window.showWindow()
  release({ x: 0, y: 0, width: 1920, height: 1040 })
  await shown
  expect(api.setBounds).toHaveBeenCalledTimes(1)
  expect(window.isShowed.value).toBe(true)
})
