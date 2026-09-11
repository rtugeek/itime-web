import { type AddTrayOptions, Channel, ElectronApi, TrayApi } from '@widget-js/core'

export interface UseTrayOptions extends AddTrayOptions {
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onClick?: () => void
}
export function useTray(options: UseTrayOptions) {
  TrayApi.setTray({
    image: options.image,
    tooltip: options.tooltip,
  })
  ElectronApi.addIpcListener(Channel.TRAY, (...args: any[]) => {
    const event = args[0] as string
    switch (event) {
      case TrayApi.EVENT_CLICK:{
        options?.onClick?.()
        break
      }
      case TrayApi.EVENT_MOUSE_ENTER:{
        options?.onMouseEnter?.()
        break
      }
      case TrayApi.EVENT_MOUSE_LEAVE:{
        options?.onMouseLeave?.()
        break
      }
    }
  })
}
