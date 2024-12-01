export type AndroidApiType = 'AndroidPomodoroSceneRepository' | 'AndroidApi'
export class AndroidApi {
  static hasApi() {
    return this.getApi() != undefined
  }

  private static getApi(): any {
    return window.AndroidApi
  }

  static back() {
    this.getApi().back()
  }

  static request<T>(api: AndroidApiType, method: string, ...params: string[]): T | null {
    const nativeApi = window[api] as any
    if (nativeApi) {
      const data = nativeApi[method](...params)
      if (data) {
        return JSON.parse(data) as T
      }
      else {
        return null
      }
    }
    else {
      throw new Error(`Android Api ${api} not found`)
    }
  }

  static requestString<T>(api: AndroidApiType, method: string, ...params: string[]): T | null {
    const nativeApi = window[api] as any
    if (nativeApi) {
      const data = nativeApi[method](...params)
      if (data) {
        return data
      }
      else {
        return null
      }
    }
    else {
      throw new Error(`Android Api ${api} not found`)
    }
  }

  static getLanguage() {
    return this.requestString<string>('AndroidApi', 'getLanguage')
  }

  static getAccessToken() {
    return this.requestString<string>('AndroidApi', 'getAccessToken')
  }
}
