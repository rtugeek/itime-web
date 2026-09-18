import { afterEach, expect, it, vi } from 'vitest'
import { createWindowSizeGuard } from '@/widgets/pomodoro/windowSizeGuard'

afterEach(() => vi.useRealTimers())

it('等待移动稳定，解除尺寸锁再修正，并在停止后清理轮询', async () => {
  vi.useFakeTimers()
  const bounds = { x: 0, y: 0, width: 150, height: 160 }
  let min = [150, 160]
  let max = [150, 160]
  const api = {
    getBounds: vi.fn(async () => ({ ...bounds })),
    getMinimumSize: vi.fn(async () => min),
    getMaximumSize: vi.fn(async () => max),
    setMinimumSize: vi.fn(async (w: number, h: number) => { min = [w, h] }),
    setMaximumSize: vi.fn(async (w: number, h: number) => { max = [w, h] }),
    setSize: vi.fn(async (w: number, h: number) => {
      expect(min).toEqual([0, 0])
      expect(max).toEqual([150, 150])
      bounds.width = w
      bounds.height = h
    }),
  }
  const stop = createWindowSizeGuard(api, 150)
  await vi.advanceTimersByTimeAsync(300)
  bounds.y = 20
  await vi.advanceTimersByTimeAsync(600)
  expect(api.setSize).not.toHaveBeenCalled()
  await vi.advanceTimersByTimeAsync(300)
  expect(api.setSize).toHaveBeenCalledWith(150, 150, false)
  expect(min).toEqual([150, 150])
  await vi.advanceTimersByTimeAsync(900)
  expect(api.setSize).toHaveBeenCalledTimes(1)
  // 模拟动画收尾再次覆盖尺寸。
  bounds.height = 165
  await vi.advanceTimersByTimeAsync(300)
  expect(api.setSize).toHaveBeenCalledTimes(2)
  stop()
  const calls = api.getBounds.mock.calls.length
  await vi.advanceTimersByTimeAsync(900)
  expect(api.getBounds).toHaveBeenCalledTimes(calls)
})
