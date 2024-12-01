import type { AxiosInstance } from 'axios'
import axios from 'axios'
import { buildWebStorage, setupCache } from 'axios-cache-interceptor'
import { showNotify } from '@nutui/nutui'
import { SignatureUtils } from '@/utils/SignatureUtils'
import { AppConfig } from '@/common/AppConfig'
import { useUserStore } from '@/stores/useUserStore'
import { AndroidApi } from '@/api/android/AndroidApi'
// import { setupCache } from 'axios-cache-interceptor/dev';

const baseURL = 'https://itime.fun/api/v2'
// const baseURL = 'http://127.0.0.1:8082/api/v2'
const api = axios.create({ baseURL, withCredentials: true })
const cacheApi = setupCache(axios.create({ baseURL, withCredentials: true }), {
  storage: buildWebStorage(localStorage, 'itime-api-cache:'),
  debug(msg) {
    console.error(msg)
  },
})

/**
 * 生成10位随机字符串
 */
function generateNonceStr() {
  return Math.random().toString(36).substring(2, 12)
}

function setupInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use((config) => {
    const appKey = '1'
    const nonce = generateNonceStr()
    const timestamp = new Date().getTime()
    config.headers.appKey = appKey
    config.headers.nonce = nonce
    config.headers['content-type'] = 'application/json;charset=UTF-8'
    config.headers.timestamp = timestamp
    config.headers.sign = SignatureUtils.sign(config.params, appKey, timestamp.toString(), nonce)
    const token = AndroidApi.hasApi() ? AndroidApi.getAccessToken() : localStorage.getItem(AppConfig.KEY_TOKEN)
    if (token) {
      config.headers.set('itime-token', token)
    }
    return config
  }, (error) => {
    // Do something with request error
    return Promise.reject(error)
  })

  instance.interceptors.response.use((response) => {
    if (response.data && response.data.code != 0) {
      if (response.data.code == 1003) {
        showNotify.danger('登录已过期，请重新登录')
        localStorage.removeItem(AppConfig.KEY_TOKEN)
        const userStore = useUserStore()
        userStore.logout()
      }
      else {
        showNotify.danger(response.data.message)
      }
      throw new Error(response.data.message)
    }
    else {
      return response.data.data
    }
  })
}

setupInterceptors(api)
setupInterceptors(cacheApi)

export { api, cacheApi }
