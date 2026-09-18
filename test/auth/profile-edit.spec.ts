import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { api } from '@/api/Api'
import { UserApi } from '@/api/UserApi'
import { uploadAvatar } from '@/api/AvatarApi'
import { AppConfig } from '@/common/AppConfig'
import { useUserStore } from '@/stores/useUserStore'
import type { User } from '@/data/User'

const { put, oss } = vi.hoisted(() => ({ put: vi.fn(), oss: vi.fn() }))
vi.mock('ali-oss', () => ({ default: oss.mockImplementation(() => ({ put })) }))
vi.mock('vue-sonner', () => ({ toast: { error: vi.fn() } }))
vi.mock('@/data/repository/UserDataRepository', () => ({ UserDataRepository: {} }))
vi.mock('@/data/repository/PomodoroHistoryRepository', () => ({ PomodoroHistoryRepository: {} }))
vi.mock('@/data/sync/UserDataSync', () => ({ UserDataSync: {} }))
vi.mock('@/data/sync/PomodoroHistorySync', () => ({ PomodoroHistorySync: {} }))

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  setActivePinia(createPinia())
  localStorage.setItem(AppConfig.KEY_TOKEN, 'test-token')
  put.mockResolvedValue({ data: { code: 0 } })
})

function respond(data: unknown, code = 0) {
  api.defaults.adapter = async config => ({ data: { code, message: '业务失败', data }, status: 200, statusText: 'OK', headers: {}, config })
}

describe('profile editing', () => {
  it('sends the nickname as an authenticated PUT form and rejects business failures', async () => {
    api.defaults.adapter = async (config) => {
      expect(config.method).toBe('put')
      expect(config.url).toBe('/users/nick')
      expect(config.headers.get('itime-token')).toBe('test-token')
      expect(new URLSearchParams(config.data).get('nick')).toBe('名字 &=+')
      return { data: { code: 0, data: null }, status: 200, statusText: 'OK', headers: {}, config }
    }
    await UserApi.updateNick('名字 &=+')
    respond(null, 1)
    await expect(UserApi.updateNick('名字')).rejects.toThrow('业务失败')
  })

  it('uses the V1 credential list, unique object names and an OSS callback', async () => {
    api.defaults.adapter = async (config) => {
      expect(config.baseURL).toMatch(/\/v1$/)
      expect(config.url).toBe('/oss/sts')
      expect(config.params).toEqual({ action: 'avatar' })
      expect(config.headers.get('itime-token')).toBe('test-token')
      return { data: { code: 0, data: [{ accessKeyId: 'temporary-id', accessKeySecret: 'temporary-secret', securityToken: 'temporary-token' }] }, status: 200, statusText: 'OK', headers: {}, config }
    }
    const file = new File(['image'], 'avatar.png', { type: 'image/png' })
    await uploadAvatar(file, 'user-uuid', () => true)
    await uploadAvatar(file, 'user-uuid', () => true)
    expect(oss).toHaveBeenCalledWith(expect.objectContaining({ stsToken: 'temporary-token', secure: true }))
    const [filename, uploadedFile, options] = put.mock.calls[0]
    expect(filename).toMatch(/^avatar\/user-uuid\/.+\.png$/)
    expect(filename).not.toBe(put.mock.calls[1][0])
    expect(uploadedFile).toBe(file)
    expect(options.callback.body).toBe(`action=avatar&uuid=user-uuid&filename=\${object}`)
    expect(options.callback.url).toMatch(/\/v1\/oss\/callback$/)
    put.mockResolvedValueOnce({ data: { code: 1, message: '回调失败' } })
    await expect(uploadAvatar(file, 'user-uuid', () => true)).rejects.toThrow('回调失败')
  })

  it('stops uploads for malformed STS responses, unsupported files and changed sessions', async () => {
    const file = new File(['image'], 'avatar.png', { type: 'image/png' })
    respond({ accessKeyId: 'wrong-shape' })
    await expect(uploadAvatar(file, 'user-uuid', () => true)).rejects.toThrow('上传凭证')
    await expect(uploadAvatar(new File(['svg'], 'avatar.svg', { type: 'image/svg+xml' }), 'user-uuid', () => true)).rejects.toThrow('5 MB')
    respond([{ accessKeyId: 'id', accessKeySecret: 'secret', securityToken: 'token' }])
    await expect(uploadAvatar(file, 'user-uuid', vi.fn().mockReturnValueOnce(true).mockReturnValue(false))).rejects.toThrow('登录状态已改变')
    expect(put).not.toHaveBeenCalled()
  })

  it('refreshes shared profile data without overwriting a newer session', async () => {
    const store = useUserStore()
    store.user = { uuid: 'first', accessToken: 'test-token' } as User
    respond({ uuid: 'first', nick: '新昵称', avatar: 'new-avatar', password: 'discard' })
    await store.refreshProfile()
    expect(store.user).toMatchObject({ nick: '新昵称', avatar: 'new-avatar', accessToken: 'test-token' })
    expect(store.user?.password).toBeUndefined()
    api.defaults.adapter = async (config) => {
      store.user = { uuid: 'second', accessToken: 'new-token' } as User
      return { data: { code: 0, data: { uuid: 'first' } }, status: 200, statusText: 'OK', headers: {}, config }
    }
    await expect(store.refreshProfile()).rejects.toThrow('登录状态已改变')
    expect(store.user?.uuid).toBe('second')
  })
})
