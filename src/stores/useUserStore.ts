import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { User } from '@/data/User'
import { UserApi } from '@/api/UserApi'
import { AppConfig } from '@/common/AppConfig'
import { UserDataRepository } from '@/data/repository/UserDataRepository'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'
import { UserDataSync } from '@/data/sync/UserDataSync'
import { PomodoroHistorySync } from '@/data/sync/PomodoroHistorySync'

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
  const login = async (loginUser: User) => {
    if (!loginUser.accessToken && !loginUser.accessTokenV2) { throw new Error('登录未返回有效凭证') }
    loginUser = { ...loginUser, accessToken: loginUser.accessTokenV2 || loginUser.accessToken }
    delete loginUser.password

    localStorage.setItem(AppConfig.KEY_TOKEN, loginUser.accessToken)
    user.value = loginUser

    const newUserId = userId.value
    if (newUserId != null) {
      await UserDataRepository.claimUnownedToUser(newUserId)
      await PomodoroHistoryRepository.claimUnownedToUser(newUserId)
      // 先等待场景同步完成，再让历史记录上传，避免 beforeUpload 判定「场景未同步」。
      await UserDataSync.sync()
      void PomodoroHistorySync.sync()
    }

    return loginUser
  }

  const loginByPassword = async (phone: string, password: string) => {
    const remoteUser = await UserApi.loginByPassword(phone, password)
    latestUsername.value = phone
    return login(remoteUser)
  }

  const loginBySms = async (phone: string, code: string) => {
    const remoteUser = await UserApi.loginBySms(phone, code)
    latestUsername.value = phone
    return login(remoteUser)
  }

  const clearSession = () => {
    user.value = undefined
    localStorage.removeItem(AppConfig.KEY_TOKEN)
  }

  const userId = computed(() => {
    const id = Number(user.value?.id ?? user.value?.userId ?? user.value?.uuid)
    return Number.isSafeInteger(id) && id > 0 ? id : undefined
  })
  const isLogin = computed(() => !!user.value?.accessToken)

  const register = async (phone: string, password: string, code: string) => {
    const remoteUser = await UserApi.register(phone, password, code)
    return login(remoteUser)
  }
  const logout = async () => {
    try {
      if (user.value) { await UserApi.logout(user.value.accessToken) }
    }
    finally { clearSession() }
  }
  const refreshProfile = async () => {
    const token = user.value?.accessToken
    if (!token) { throw new Error('请先登录') }
    const profile = await UserApi.profile()
    delete profile.password
    if (user.value?.accessToken !== token) { throw new Error('登录状态已改变，请重新打开账户页面') }
    user.value = { ...profile, accessToken: token }
  }
  const init = async () => {
    if (!isLogin.value) { return }
    try {
      await refreshProfile()
    }
    catch { /* Expired sessions are cleared by the interceptor. */ }
  }
  const loginByEmail = async (email: string, password: string) => {
    const account = await UserApi.loginByEmail(email, password)
    latestUsername.value = email
    return login(account)
  }
  const registerEmail = async (email: string, password: string, code: string) => login(await UserApi.registerEmail(email, password, code))
  const loginByWechat = async (code: string, appId: string) => login(await UserApi.loginByWechat(code, appId))
  return { userId, init, refreshProfile, clearSession, loginByEmail, registerEmail, loginByWechat, user, isLogin, latestUsername, loginByPassword, loginBySms, register, logout }
})
