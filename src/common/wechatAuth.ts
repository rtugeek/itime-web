const key = 'itime.wechat.authorization'
export function safeRedirect(value: unknown): string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && !value.startsWith('/user') ? value : '/countdown'
}
export function startWechatLogin(redirect: unknown) {
  const appId = import.meta.env.VITE_WECHAT_APP_ID
  const callback = import.meta.env.VITE_WECHAT_REDIRECT_URI
  if (!appId || !callback) { throw new Error('微信登录暂未配置，请使用邮箱登录') }
  const callbackUrl = new URL(callback)
  if (callbackUrl.origin !== window.location.origin || callbackUrl.hash) { throw new Error('微信回调地址必须与当前页面同源且不含 hash') }
  const state = Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('')
  sessionStorage.setItem(key, JSON.stringify({ state, appId, redirect: safeRedirect(redirect), created: Date.now() }))
  const query = new URLSearchParams({ appid: appId, redirect_uri: callback, response_type: 'code', scope: 'snsapi_login', state })
  window.location.assign(`https://open.weixin.qq.com/connect/qrconnect?${query}#wechat_redirect`)
}
export function consumeWechatState(state: string) {
  const raw = sessionStorage.getItem(key)
  sessionStorage.removeItem(key)
  if (!raw) { throw new Error('微信登录已失效，请重新发起登录') }
  const saved = JSON.parse(raw)
  if (!state || saved.state !== state || Date.now() - saved.created > 10 * 60 * 1000) { throw new Error('微信授权校验失败，请重新登录') }
  return saved as { appId: string, redirect: string }
}
// WeChat appends query parameters before the hash used by Vue Router.
export function normalizeWechatCallback() {
  const params = new URLSearchParams(window.location.search)
  if (!params.has('state') || !params.has('code')) { return }
  const query = new URLSearchParams({ code: params.get('code')!, state: params.get('state')! })
  params.delete('code'); params.delete('state')
  const search = params.size ? `?${params}` : ''
  window.history.replaceState(null, '', `${window.location.pathname}${search}#/user/wechat/callback?${query}`)
}
