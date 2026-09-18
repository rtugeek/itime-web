import { api } from '@/api/Api'

interface AvatarCredentials {
  accessKeyId: string
  accessKeySecret: string
  securityToken: string
}

export async function uploadAvatar(file: File, uuid: string, isCurrentSession: () => boolean) {
  if (!uuid || !/^[\w-]+$/.test(uuid)) { throw new Error('无法获取账号信息，请重新登录') }
  if (!isCurrentSession()) { throw new Error('请先登录') }
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type]
  if (!extension || !file.size || file.size > 5 * 1024 * 1024) { throw new Error('请选择 5 MB 以内的 JPG、PNG 或 WebP 图片') }
  const baseURL = String(api.defaults.baseURL).replace(/\/v2\/?$/, '/v1')
  const credentials = await api.get<unknown, AvatarCredentials[]>('/oss/sts', { baseURL, params: { action: 'avatar' } })
  const credential = credentials?.[0]
  if (!credential?.accessKeyId || !credential.accessKeySecret || !credential.securityToken) {
    throw new Error('无法获取上传凭证，请稍后重试')
  }
  const { default: OSS } = await import('ali-oss')
  if (!isCurrentSession()) { throw new Error('登录状态已改变，请重新打开账户页面') }
  const client = new OSS({
    bucket: import.meta.env.VITE_OSS_BUCKET || 'we-moment',
    endpoint: import.meta.env.VITE_OSS_ENDPOINT || 'https://oss-cn-beijing.aliyuncs.com',
    secure: true,
    accessKeyId: credential.accessKeyId,
    accessKeySecret: credential.accessKeySecret,
    stsToken: credential.securityToken,
  })
  const filename = `avatar/${uuid}/${crypto.randomUUID()}.${extension}`
  const result = await client.put(filename, file, {
    mime: file.type,
    callback: {
      url: import.meta.env.VITE_OSS_CALLBACK_URL || `${baseURL}/oss/callback`,
      body: `action=avatar&uuid=${encodeURIComponent(uuid)}&filename=\${object}`,
      contentType: 'application/x-www-form-urlencoded',
    },
  })
  const response = result.data as { code?: number, message?: string } | undefined
  if (response?.code !== 0) { throw new Error(response?.message || '上传回调未确认成功，请刷新资料后重试') }
}
