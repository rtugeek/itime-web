import { api } from '@/api/Api'
import type { User } from '@/data/User'

export class UserApi {
  static async loginByPassword(phone: string, password: string): Promise<User> {
    return await api.post(`/user/login?phone=${phone}&password=${password}&clientType=WEB`)
  }

  static async loginBySms(phone: string, code: string): Promise<User> {
    return await api.post(`/user/login/sms?phone=${phone}&code=${code}&clientType=WEB`)
  }

  static async register(phone: string, password: string, code: string): Promise<User> {
    return await api.post(`/user/register?phone=${phone}&password=${password}&code=${code}`)
  }
}
