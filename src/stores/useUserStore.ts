import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import consola from 'consola'
import type { User } from '@/data/User'
import { UserApi } from '@/api/UserApi'
import { AppConfig } from '@/common/AppConfig'
import { AndroidApi } from '@/api/android/AndroidApi'
import { AndroidUserApi } from '@/api/android/AndroidUserApi'

export const useUserStore = defineStore('userStore', () => {
  const latestUsername = useStorage(AppConfig.KEY_LATEST_USER, '')
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
  const login = (loginUser: User) => {
    consola.log(loginUser)
    localStorage.setItem(AppConfig.KEY_TOKEN, loginUser.accessToken)
    user.value = loginUser
    return loginUser
  }

  const loginByPassword = async (phone: string, password: string) => {
    const remoteUser = await UserApi.loginByPassword(phone, password)
    console.log(remoteUser)
    latestUsername.value = phone
    return login(remoteUser)
  }

  const logout = () => {
    user.value = undefined
    localStorage.removeItem(AppConfig.KEY_TOKEN)
  }

  if (AndroidApi.hasApi()) {
    const androidUser = AndroidUserApi.getUser()
    if (androidUser) {
      consola.info(androidUser)
      login(androidUser)
    }
  }

  const isLogin = computed(() => user.value != undefined)

  const register = async (phone: string, password: string, code: string) => {
    const remoteUser = await UserApi.register(phone, password, code)
    return login(remoteUser)
  }
  return { user, isLogin, latestUsername, loginByPassword, register, logout }
})
