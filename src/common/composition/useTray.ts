import { type AddTrayOptions, Channel, ElectronApi, TrayApi, TrayApiEvent } from '@widget-js/core'

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
    const event = args[0] as TrayApiEvent
    switch (event) {
      case TrayApiEvent.CLICK:{
        options?.onClick?.()
        break
      }
      case TrayApiEvent.MOUSE_ENTER:{
        options?.onMouseEnter?.()
        break
      }
      case TrayApiEvent.MOUSE_LEAVE:{
        options?.onMouseLeave?.()
        break
      }
    }
  })
}
