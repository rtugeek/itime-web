import { describe, expect, it } from 'vitest'
import { avatarCropRect } from '@/utils/avatarCrop'

describe('square avatar cropping', () => {
  it.each([
    [1200, 800, 200, 0, 800],
    [800, 1200, 0, 200, 800],
    [600, 600, 0, 0, 600],
  ])('centers a %s × %s image without stretching', (width, height, x, y, size) => {
    expect(avatarCropRect(width, height, 1, width / 2, height / 2)).toEqual({ x, y, size })
  })

  it('zooms into the selected center with equal source width and height', () => {
    expect(avatarCropRect(1200, 800, 2, 600, 400)).toEqual({ x: 400, y: 200, size: 400 })
  })

  it.each([1, 2, 4])('keeps dragged crops inside the image at zoom %s', (zoom) => {
    for (const [width, height] of [[1200, 800], [800, 1200]]) {
      for (const center of [-10000, 0, 500, 10000]) {
        const { x, y, size } = avatarCropRect(width, height, zoom, center, center)
        expect(x).toBeGreaterThanOrEqual(0)
        expect(y).toBeGreaterThanOrEqual(0)
        expect(x + size).toBeLessThanOrEqual(width)
        expect(y + size).toBeLessThanOrEqual(height)
      }
    }
  })
})
