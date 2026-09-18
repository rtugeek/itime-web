import { api } from '@/api/Api'
import type { User } from '@/data/User'

function post<T>(path: string, values: Record<string, string>) {
  return api.post<unknown, T>(path, new URLSearchParams(values))
}
export class UserApi {
  static loginByEmail(email: string, password: string) { return post<User>('/user/login/email', { email, password, clientType: 'WEB' }) }
  static sendEmailCode(email: string, type: 'register' | 'reset' | 'login') { return post<void>('/mail/code', { email, type }) }
  static registerEmail(email: string, password: string, code: string) { return post<User>('/mail/register', { email, password, code, clientType: 'WEB' }) }
  static resetPassword(email: string, password: string, code: string) { return post<void>('/mail/password', { email, password, code }) }
  static loginByWechat(code: string, appId: string) { return post<User>('/wechat/login', { code, appId, clientType: 'WEB' }) }
  static profile() { return api.get<unknown, User>('/user/profile') }
  static updateNick(nick: string) { return api.put<unknown, void>('/users/nick', new URLSearchParams({ nick })) }
  static logout(token: string) { return api.post<unknown, void>('/user/logout', null, { headers: { token } }) }
  static loginByPassword(phone: string, password: string) { return post<User>('/user/login', { phone, password, clientType: 'WEB' }) }
  static loginBySms(phone: string, code: string) { return post<User>('/user/login/sms', { phone, code, clientType: 'WEB' }) }
  static register(phone: string, password: string, code: string) { return post<User>('/user/register', { phone, password, code, clientType: 'WEB' }) }
  static isPhoneUsed(phone: string) { return api.get<unknown, boolean>('/user/phone/used', { params: { phone } }) }
}
