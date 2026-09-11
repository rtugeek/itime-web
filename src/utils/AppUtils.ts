import type { Router } from 'vue-router'

export class AppUtils {
  static back(router: Router, closeIfEmpty: boolean = false) {
    if (window.history.length == 1) {
      if (closeIfEmpty) {
        window.close()
      }
      else {
        router.push('/')
      }
    }
    else {
      router.back()
    }
  }
}
