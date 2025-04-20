import type { Rectangle } from '@widget-js/core'

export class RectUtils {
  static getRelativePosition(rect: Rectangle, compareRect: Rectangle): 'left' | 'top' | 'bottom' | 'right' | 'inner' {
    if (rect.x < compareRect.x) {
      return 'left'
    }
    else if (rect.x > compareRect.x + compareRect.width) {
      return 'right'
    }
    else if (rect.y < compareRect.y) {
      return 'top'
    }
    else if (rect.y > compareRect.y + compareRect.height) {
      return 'bottom'
    }
    else {
      return 'inner'
    }
  }

  /**
   * 按照要求缩放矩形
   * @param rect
   * @param scale
   */
  static scale(rect: Rectangle, scale: number): Rectangle {
    let x = rect.x
    let y = rect.y
    let width = rect.width
    let height = rect.height
    if (rect.x < 0) {
      x = rect.x * scale
      width = rect.width * scale
    }else{
      x = rect.x * scale
      width = rect.width * scale
    }
    if (rect.y < 0) {
      y = rect.y * scale
      height = rect.y * scale
    }
    return {
      x,
      y,
      width,
      height,
    }
  }
}
