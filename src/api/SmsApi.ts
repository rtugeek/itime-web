import { api } from '@/api/Api'

export class SmsApi {
  static async getCode(phone: string): Promise<void> {
    return api.get(`/sms?phone=${phone}`)
  }
}
