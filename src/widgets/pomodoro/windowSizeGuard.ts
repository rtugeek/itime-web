interface WindowSizeApi {
  getBounds: () => Promise<{ x: number, y: number, width: number, height: number }>
  getMinimumSize: () => Promise<number[]>
  getMaximumSize: () => Promise<number[]>
  setMinimumSize: (width: number, height: number) => Promise<void>
  setMaximumSize: (width: number, height: number) => Promise<void>
  setSize: (width: number, height: number, animate?: boolean) => Promise<void>
}

// 动画会临时锁定 min/max，且 Promise 早于动画完成返回。
// 连续三次位置一致后修正，并回读后续状态，避免动画收尾恢复旧尺寸限制。
export function createWindowSizeGuard(api: WindowSizeApi, size: number) {
  let stopped = false
  let timer: ReturnType<typeof setTimeout> | undefined
  let previous: { x: number, y: number } | undefined
  let stableSamples = 0

  async function check() {
    try {
      const bounds = await api.getBounds()
      if (stopped) { return }
      stableSamples = previous?.x === bounds.x && previous?.y === bounds.y ? stableSamples + 1 : 0
      previous = bounds
      if (stableSamples < 2) { return }

      const min = await api.getMinimumSize()
      const max = await api.getMaximumSize()
      if (stopped) { return }
      const wrongLimits = min[0] !== size || min[1] !== size || max[0] !== size || max[1] !== size
      if (wrongLimits || bounds.width !== size || bounds.height !== size) {
        // 先解除可能被动画锁大的最小尺寸，否则窗口无法缩回目标尺寸。
        await api.setMinimumSize(0, 0)
        if (stopped) { return }
        await api.setMaximumSize(size, size)
        if (stopped) { return }
        await api.setSize(size, size, false)
        if (stopped) { return }
        await api.setMinimumSize(size, size)
      }
    }
    catch (error) {
      if (!stopped) { console.warn('Failed to restore pomodoro window size', error) }
    }
    finally {
      // 串行轮询，避免异步 IPC 重叠；关闭组件后不再发起检查。
      if (!stopped) { timer = setTimeout(check, 300) }
    }
  }

  timer = setTimeout(check, 300)
  return () => {
    stopped = true
    clearTimeout(timer)
  }
}
