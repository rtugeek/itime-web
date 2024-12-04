import { AndroidApi } from '@/api/android/AndroidApi'
import type { User } from '@/data/User'

export class AndroidClipboardApi {
  static copy(text: string) {
    return AndroidApi.request<User>('AndroidClipboardApi', 'copy', text)
  }
}
