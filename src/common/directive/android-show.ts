import type { Directive } from 'vue'
import { AndroidApi } from '@/api/android/AndroidApi'

export const showInAndroid = <Directive<HTMLElement, string>>{
  mounted(el: any) {
    if (!AndroidApi.hasApi()) {
      el.parentNode.removeChild(el)
    }
  },
}

export const hideInAndroid = <Directive<HTMLElement, string>>{
  mounted(el: any) {
    if (AndroidApi.hasApi()) {
      el.parentNode.removeChild(el)
    }
  },
}
