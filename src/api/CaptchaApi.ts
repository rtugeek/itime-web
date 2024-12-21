import { api } from '@/api/Api'

export class CaptchaApi {
  static async get(): Promise<CaptchaResult> {
    return api.get(`/captcha`)
  }
}

export interface CaptchaResult {
  uuid: string
  img: string
}
