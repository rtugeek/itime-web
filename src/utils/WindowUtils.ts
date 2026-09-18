import { BrowserWindowApi } from '@widget-js/core'

export class WindowUtils {
  static open(url: string) {
    BrowserWindowApi.openUrl(`${url}?frame=true&transparent=false&width=400&height=700`, {
      width: 900,
      height: 700,
      resizable: true,
      minimizable: true,
      frame: true,
      maximizable: true,
      transparent: false,
    })
  }
}
