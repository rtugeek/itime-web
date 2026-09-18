import type { AxiosInstance } from 'axios'
import axios from 'axios'
import { buildWebStorage, setupCache } from 'axios-cache-interceptor'
import { toast } from 'vue-sonner'
import { AppConfig } from '@/common/AppConfig'
import { useUserStore } from '@/stores/useUserStore'

const baseURL = import.meta.env.VITE_ITIME_API_BASE_URL || 'https://itime.fun/api/v2'
const api = axios.create({ baseURL, timeout: 15000 })
const cacheApi = setupCache(axios.create({ baseURL, timeout: 15000 }), {
  storage: buildWebStorage(localStorage, 'itime-api-cache:'),
  debug(msg) {
    console.error(msg)
  },
})

function setupInterceptors(instance: AxiosInstance) {
  // A response from a previous login must never invalidate the current session.
  const clearRequestSession = (config?: { headers?: { get: (name: string) => unknown } }) => {
    const requestToken = config?.headers?.get('itime-token')
    if (requestToken === localStorage.getItem(AppConfig.KEY_TOKEN)) {
      useUserStore().clearSession()
      toast.error('登录已过期，请重新登录')
    }
  }
  instance.interceptors.request.use((config) => {
    if (config.data instanceof URLSearchParams) { config.headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8') }
    const token = localStorage.getItem(AppConfig.KEY_TOKEN)
    if (token) {
      config.headers.set('itime-token', token)
    }
    return config
  }, (error) => {
    return Promise.reject(error)
  })

  instance.interceptors.response.use((response) => {
    if (response.data && response.data.code != 0) {
      if ([1003, 1004].includes(response.data.code)) {
        clearRequestSession(response.config)
      }
      else {
        toast.error(response.data.message)
      }
      throw new Error(response.data.message)
    }
    else {
      return response.data.data
    }
  }, (error) => {
    if (error.response?.status === 401) { clearRequestSession(error.config) }
    return Promise.reject(new Error(error.response?.data?.message || '网络请求失败，请稍后重试'))
  })
}

setupInterceptors(api)
setupInterceptors(cacheApi)

export { api, cacheApi }
