import { api } from '@/api/Api'

export class SmsApi {
  static async getCode(phone: string, code?: string, uuid?: string): Promise<void> {
    return api.get(`/sms?phone=${phone}&code=${code}&uuid=${uuid}`)
  }
}
