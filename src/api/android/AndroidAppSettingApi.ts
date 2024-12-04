import { AndroidApi } from '@/api/android/AndroidApi'

export class AndroidAppSettingApi {
  static subscribeICS(url: string) {
    return AndroidApi.request<void>('AndroidAppSettingApi', 'subscribeICS', url)
  }

  static requestPinWidget(type: number, layoutStyle: number) {
    return AndroidApi.request<void>('AndroidAppSettingApi', 'requestPinWidget', type.toString(), layoutStyle.toString())
  }
}
