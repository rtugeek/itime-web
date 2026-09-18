import { ref } from 'vue'

type Edge = 'top' | 'bottom' | 'left' | 'right'
interface Bounds { x: number, y: number, width: number, height: number }
interface EdgeWindowApi {
  getBounds: () => Promise<Bounds>
  getWorkArea: (point: { x: number, y: number }) => Promise<Bounds>
  setBounds: (bounds: Bounds) => Promise<unknown>
  show: () => Promise<unknown>
  setAlwaysOnTop: (value: boolean) => Promise<unknown>
  isDraggingWindow?: () => Promise<boolean>
}

// 所有位置写入串行执行；显示始终恢复隐藏前的边缘，不重新猜测边缘。
export function createEdgeWindow(api: EdgeWindowApi, initialEdge: Edge, peakSize = 6) {
  const stickEdge = ref<Edge>(initialEdge)
  const isShowed = ref(true)
  let disposed = false
  let timer: ReturnType<typeof setTimeout> | undefined
  let queue = Promise.resolve()
  let generation = 0
  let visibleBounds: Bounds | undefined
  let lastPosition: { x: number, y: number } | undefined
  let animating = false

  async function animatePosition(from: Bounds, to: { x: number, y: number }, cancelled: () => boolean) {
    const started = Date.now()
    animating = true
    try {
      while (!cancelled()) {
        if (await api.isDraggingWindow?.()) { return }
        if (cancelled()) { return }
        const progress = Math.min(1, (Date.now() - started) / 240)
        const eased = 1 - (1 - progress) ** 3
        lastPosition = {
          x: Math.round(from.x + (to.x - from.x) * eased),
          y: Math.round(from.y + (to.y - from.y) * eased),
        }
        // 等待每帧 IPC 完成，并同时设置宽高，保持动画期间窗口尺寸稳定。
        await api.setBounds({ ...lastPosition, width: from.width, height: from.height })
        if (progress === 1) { return }
        await new Promise(resolve => setTimeout(resolve, 16))
      }
    }
    finally {
      animating = false
    }
  }

  function cancelHide() {
    generation++
    clearTimeout(timer)
  }

  function move(visible: boolean, edge?: Edge | 'nearest' | 'bottom-center') {
    const request = generation
    queue = queue.then(async () => {
      if (disposed || (!visible && request !== generation)) { return }
      if (await api.isDraggingWindow?.()) {
        cancelHide()
        return
      }
      const bounds = await api.getBounds()
      const anchor = !edge && !isShowed.value && visibleBounds ? visibleBounds : bounds
      const area = await api.getWorkArea({
        x: anchor.x + anchor.width / 2,
        y: anchor.y + anchor.height / 2,
      })
      const maxX = area.x + Math.max(0, area.width - bounds.width)
      const maxY = area.y + Math.max(0, area.height - bounds.height)
      const position = {
        x: Math.min(maxX, Math.max(area.x, anchor.x)),
        y: Math.min(maxY, Math.max(area.y, anchor.y)),
      }
      let targetEdge: Edge = edge === 'bottom-center' ? 'bottom' : edge === 'nearest' ? stickEdge.value : edge ?? stickEdge.value
      if (edge === 'nearest') {
        const distances: [Edge, number][] = [
          ['bottom', Math.abs(bounds.y + bounds.height - area.y - area.height)],
          ['top', Math.abs(bounds.y - area.y)],
          ['left', Math.abs(bounds.x - area.x)],
          ['right', Math.abs(bounds.x + bounds.width - area.x - area.width)],
        ]
        targetEdge = distances.sort((a, b) => a[1] - b[1])[0]![0]
      }
      if (edge === 'bottom-center') { position.x = Math.round((area.x + maxX) / 2) }
      if (targetEdge === 'left') { position.x = area.x }
      if (targetEdge === 'right') { position.x = maxX }
      if (targetEdge === 'top') { position.y = area.y }
      if (targetEdge === 'bottom') { position.y = maxY }
      const restored = { ...bounds, ...position }
      if (!visible) {
        if (targetEdge === 'left') { position.x = area.x - bounds.width + peakSize }
        if (targetEdge === 'right') { position.x = area.x + area.width - peakSize }
        if (targetEdge === 'top') { position.y = area.y - bounds.height + peakSize }
        if (targetEdge === 'bottom') { position.y = area.y + area.height - peakSize }
      }
      if (disposed || (!visible && request !== generation)) { return }
      visibleBounds = restored
      stickEdge.value = targetEdge
      // 隐藏开始就切换状态，鼠标返回时可以立即从动画中途弹出。
      if (!visible) { isShowed.value = false }
      if (visible && !disposed) {
        await api.show()
        if (!disposed) { await api.setAlwaysOnTop(true) }
      }
      const cancelled = () => disposed || (!visible && request !== generation)
      if (cancelled()) { return }
      if (edge !== 'bottom-center' && (bounds.x !== position.x || bounds.y !== position.y)) {
        await animatePosition(bounds, position, cancelled)
      }
      else {
        lastPosition = position
        await api.setBounds({ ...position, width: bounds.width, height: bounds.height })
      }
      if (!cancelled()) { isShowed.value = visible }
    }).catch(error => console.warn('Failed to move pomodoro window', error))
    return queue
  }

  function showWindow() {
    cancelHide()
    return move(true)
  }
  function stickToEdge(edge: Edge) {
    cancelHide()
    return move(true, edge)
  }
  function startHideWindow() {
    cancelHide()
    timer = setTimeout(() => { void move(false) }, 2000)
  }
  function resetPosition() {
    cancelHide()
    return move(true, 'bottom-center')
  }
  async function onMoved() {
    if (disposed || animating) { return }
    const bounds = await api.getBounds()
    // setBounds 也会触发 moved，忽略自身写入，尤其不能重新判断隐藏位置。
    if (disposed || animating || (bounds.x === lastPosition?.x && bounds.y === lastPosition?.y)) { return }
    cancelHide()
    await move(true, 'nearest')
    if (!disposed) { startHideWindow() }
  }
  function dispose() {
    disposed = true
    cancelHide()
  }
  return { stickEdge, isShowed, showWindow, stickToEdge, startHideWindow, cancelHide, resetPosition, onMoved, dispose }
}
