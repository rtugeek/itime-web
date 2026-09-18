import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { api } from '@/api/Api'
import { UserApi } from '@/api/UserApi'
import { useUserStore } from '@/stores/useUserStore'
import { AppConfig } from '@/common/AppConfig'
import { consumeWechatState, normalizeWechatCallback, safeRedirect } from '@/common/wechatAuth'

vi.mock('vue-sonner', () => ({ toast: { error: vi.fn() } }))
vi.mock('@/data/repository/UserDataRepository', () => ({ UserDataRepository: { claimUnownedToUser: vi.fn() } }))
vi.mock('@/data/repository/PomodoroHistoryRepository', () => ({ PomodoroHistoryRepository: { claimUnownedToUser: vi.fn() } }))
vi.mock('@/data/sync/UserDataSync', () => ({ UserDataSync: { sync: vi.fn() } }))
vi.mock('@/data/sync/PomodoroHistorySync', () => ({ PomodoroHistorySync: { sync: vi.fn() } }))
beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  setActivePinia(createPinia())
  vi.restoreAllMocks()
})
describe('itime authentication', () => {
  it('sends encoded credentials in a form body and uses the itime token header', async () => {
    localStorage.setItem(AppConfig.KEY_TOKEN, 'token')
    api.defaults.adapter = async (config) => {
      expect(config.url).toBe('/user/login/email')
      expect(config.headers.get('itime-token')).toBe('token')
      expect(config.headers.get('Content-Type')).toContain('application/x-www-form-urlencoded')
      const body = new URLSearchParams(config.data)
      expect(body.get('email')).toBe('test+one@example.com')
      expect(body.get('password')).toBe('a&b=c+#')
      expect(body.get('clientType')).toBe('WEB')
      return { data: { code: 0, data: { accessToken: 'new-token' } }, status: 200, statusText: 'OK', headers: {}, config }
    }
    expect((await UserApi.loginByEmail('test+one@example.com', 'a&b=c+#')).accessToken).toBe('new-token')
  })
  it('persists an itime login without storing the returned password', async () => {
    vi.spyOn(UserApi, 'loginByEmail').mockResolvedValue({ uuid: '1', accessToken: 'token', password: 'secret' } as any)
    const store = useUserStore()
    await store.loginByEmail('a@example.com', 'secret')
    expect(store.isLogin).toBe(true)
    expect(store.user?.password).toBeUndefined()
    expect(localStorage.getItem(AppConfig.KEY_TOKEN)).toBe('token')
    vi.spyOn(UserApi, 'logout').mockRejectedValue(new Error('offline'))
    await expect(store.logout()).rejects.toThrow('offline')
    expect(store.isLogin).toBe(false)
    expect(localStorage.getItem(AppConfig.KEY_TOKEN)).toBeNull()
  })
  it('rejects business errors and clears invalid sessions', async () => {
    const store = useUserStore()
    store.user = { uuid: '1', accessToken: 'token' } as any
    localStorage.setItem(AppConfig.KEY_TOKEN, 'token')
    api.defaults.adapter = async config => ({ data: { code: 1004, message: '无效令牌' }, status: 200, statusText: 'OK', headers: {}, config })
    await expect(UserApi.profile()).rejects.toThrow('无效令牌')
    expect(store.isLogin).toBe(false)
  })
  it.each(['business', 'http'])('keeps a new session when an old request expires (%s)', async (kind) => {
    const store = useUserStore()
    localStorage.setItem(AppConfig.KEY_TOKEN, 'old-token')
    api.defaults.adapter = async (config) => {
      expect(config.headers.get('itime-token')).toBe('old-token')
      localStorage.setItem(AppConfig.KEY_TOKEN, 'new-token')
      store.user = { uuid: '2', accessToken: 'new-token' } as any
      if (kind === 'http') {
        throw Object.assign(new Error('expired'), { config, response: { status: 401 } })
      }
      return { data: { code: 1004, message: 'expired' }, status: 200, statusText: 'OK', headers: {}, config }
    }
    await expect(UserApi.profile()).rejects.toThrow()
    expect(store.user?.accessToken).toBe('new-token')
    expect(localStorage.getItem(AppConfig.KEY_TOKEN)).toBe('new-token')
  })
  it('validates and consumes OAuth state exactly once', () => {
    sessionStorage.setItem('itime.wechat.authorization', JSON.stringify({ state: 'nonce', appId: 'app', redirect: '/todo', created: Date.now() }))
    expect(consumeWechatState('nonce').redirect).toBe('/todo')
    expect(() => consumeWechatState('nonce')).toThrow()
    sessionStorage.setItem('itime.wechat.authorization', JSON.stringify({ state: 'nonce', created: Date.now() - 700000 }))
    expect(() => consumeWechatState('nonce')).toThrow()
  })
  it('normalizes WeChat query callbacks for hash routing', () => {
    window.history.replaceState(null, '', '/web/?code=abc&state=nonce')
    normalizeWechatCallback()
    expect(window.location.search).toBe('')
    expect(window.location.hash).toBe('#/user/wechat/callback?code=abc&state=nonce')
  })
  it('only allows internal return destinations', () => {
    expect(safeRedirect('//example.com')).toBe('/countdown')
    expect(safeRedirect('https://example.com')).toBe('/countdown')
    expect(safeRedirect('/todo?tab=1')).toBe('/todo?tab=1')
  })
})
