import type { Router } from 'vue-router'

export class AppUtils {
  static back(router: Router) {
    if (window.history.length == 1) {
      router.push('/')
    }
    else {
      router.back()
    }
  }
}
