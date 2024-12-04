import { AndroidApi } from '@/api/android/AndroidApi'

export class AndroidMomentRepository {
  static saveCountdownFormat(id: string, format: string) {
    return AndroidApi.request<void>('AndroidMomentRepository', 'saveCountdownFormat', id, format)
  }
}
