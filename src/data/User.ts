export interface User {
  phone: string
  avatar?: string
  nick?: string
  introduction?: string
  username?: string
  email: string
  password?: string
  uuid: string
  locale?: string
  googleId?: string
  needUpdateInfo: boolean
  accessToken: string
  needSetPassword?: boolean
}
