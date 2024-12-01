import type { Router } from 'vue-router'
import { AndroidApi } from '@/api/android/AndroidApi'

export class AppUtils {
  static back(router: Router) {
    if (AndroidApi.hasApi()) {
      AndroidApi.back()
    }
    else {
      if (window.history.length == 1) {
        router.push('/')
      }
      else {
        router.back()
      }
    }
  }
}
