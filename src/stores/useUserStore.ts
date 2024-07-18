import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import type { User } from '@/data/User'
import { UserApi } from '@/api/UserApi'
import { AppConfig } from '@/common/AppConfig'

export const useUserStore = defineStore('userStore', () => {
  const user = useStorage<User | undefined>(AppConfig.KEY_USER, undefined, undefined, {
    serializer: {
      read: (raw: string): User | undefined => {
        if (!raw) {
          return undefined
        }
        try {
          return JSON.parse(raw) as User
        }
        catch (e) {
          return undefined
        }
      },
      write: (value: User | undefined) => {
        if (value == undefined) {
          return ''
        }
        return JSON.stringify(value)
      },
    },
  })
  const token = useStorage(AppConfig.KEY_TOKEN, '')

  const login = (loginUser: User) => {
    token.value = loginUser.accessToken
    user.value = loginUser
    return loginUser
  }

  const loginByPassword = async (phone: string, password: string) => {
    const remoteUser = await UserApi.loginByPassword(phone, password)
    return login(remoteUser)
  }

  const logout = () => {
    user.value = undefined
    token.value = ''
  }

  const register = async (phone: string, password: string, code: string) => {
    const remoteUser = await UserApi.register(phone, password, code)
    return login(remoteUser)
  }
  return { user, loginByPassword, register, logout }
})
