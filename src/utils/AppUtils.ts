import type { Router } from 'vue-router'
import { AndroidApi } from '@/api/android/AndroidApi'

export class AppUtils {
  static back(router: Router, closeIfEmpty: boolean = false) {
    if (AndroidApi.hasApi()) {
      AndroidApi.back()
    }
    else {
      if (window.history.length == 1) {
        if (closeIfEmpty) {
          window.close()
        }
        else {
          // 这个是用于组件弹出界面，如果历史层级只有1，直接返回首页
          router.push('/')
        }
      }
      else {
        router.back()
      }
    }
  }
}
