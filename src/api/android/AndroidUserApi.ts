import { AndroidApi } from '@/api/android/AndroidApi'
import type { User } from '@/data/User'

export class AndroidUserApi {
  static getUser() {
    return AndroidApi.request<User>('AndroidUserApi', 'getUser')
  }
}
