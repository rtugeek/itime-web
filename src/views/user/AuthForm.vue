<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Eye, EyeOff, Loader2, MessageCircle } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/stores/useUserStore'
import { UserApi } from '@/api/UserApi'
import { safeRedirect, startWechatLogin } from '@/common/wechatAuth'
import logo from '@/assets/logo.png'

const props = defineProps<{ mode: 'login' | 'register' | 'reset' }>()
const showWechatLogin = false
const store = useUserStore()
const router = useRouter()
const route = useRoute()
const email = ref(store.latestUsername.includes('@') ? store.latestUsername : '')
const emailDomains = [
  'qq.com',
  '163.com',
  '126.com',
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'foxmail.com',
  'yeah.net',
  'sina.com',
  'sohu.com',
  '139.com',
  '189.cn',
  'aliyun.com',
  'icloud.com',
  'yahoo.com',
  'proton.me',
]
const emailSuggestions = computed(() => {
  const parts = email.value.trim().split('@')
  if (parts.length !== 2 || !parts[0] || /\s/.test(parts[0])) { return [] }
  const [username, domain] = parts
  return emailDomains
    .filter(candidate => candidate.startsWith(domain.toLowerCase()) && candidate !== domain.toLowerCase())
    .map(candidate => `${username}@${candidate}`)
})
const password = ref('')
const confirmation = ref('')
const showPassword = ref(false)
const showConfirmation = ref(false)
const code = ref('')
const error = ref('')
const busy = ref(false)
const sending = ref(false)
const seconds = ref(0)
let timer: ReturnType<typeof setInterval> | undefined
onUnmounted(() => clearInterval(timer))
const title = computed(() => ({ login: '欢迎回到 iTime', register: '创建 iTime 账户', reset: '找回密码' }[props.mode]))
const action = computed(() => ({ login: '登录', register: '注册并登录', reset: '重置密码' }[props.mode]))
const query = computed(() => ({ redirect: safeRedirect(route.query.redirect) }))
function message(e: unknown) { error.value = e instanceof Error ? e.message : '操作失败，请重试' }
async function sendCode() {
  if (sending.value || seconds.value) { return }
  if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email.value.trim())) {
    error.value = '请输入有效的邮箱地址'
    return
  }
  sending.value = true
  error.value = ''
  try {
    await UserApi.sendEmailCode(email.value.trim(), props.mode === 'register' ? 'register' : 'reset')
    seconds.value = 60
    clearInterval(timer)
    timer = setInterval(() => {
      if (--seconds.value <= 0) { clearInterval(timer) }
    }, 1000)
    toast.success('验证码已发送，请检查邮箱和垃圾邮件')
  }
  catch (e) { message(e) }
  finally { sending.value = false }
}
async function submit() {
  if (busy.value) { return }
  error.value = ''
  if (props.mode !== 'login') {
    if (!/^[A-Z0-9]{8,16}$/i.test(password.value)) {
      error.value = '密码需为 8–16 位英文字母或数字'
      return
    }
    if (password.value !== confirmation.value) {
      error.value = '两次输入的密码不一致'
      return
    }
  }
  busy.value = true
  try {
    if (props.mode === 'login') {
      await store.loginByEmail(email.value.trim(), password.value)
    }
    else if (props.mode === 'register') {
      await store.registerEmail(email.value.trim(), password.value, code.value.trim())
    }
    else {
      await UserApi.resetPassword(email.value.trim(), password.value, code.value.trim())
      store.clearSession()
      toast.success('密码已重置，请使用新密码登录')
      await router.replace({ path: '/user/sign/in', query: query.value })
      return
    }
    await router.replace(safeRedirect(route.query.redirect))
  }
  catch (e) { message(e) }
  finally { busy.value = false }
}
function wechat() {
  try { startWechatLogin(route.query.redirect) }
  catch (e) { message(e) }
}
</script>

<template>
  <div class="auth-page">
    <Card class="auth-card">
      <CardHeader class="auth-header">
        <div class="auth-icon overflow-hidden">
          <img :src="logo" alt="iTime" class="size-full object-cover">
        </div>
        <CardTitle class="auth-title">
          {{ title }}
        </CardTitle>
        <CardDescription v-if="mode === 'reset'" class="auth-description">
          通过邮箱验证码设置新的登录密码
        </CardDescription>
      </CardHeader>
      <CardContent class="auth-content">
        <form @submit.prevent="submit">
          <fieldset :disabled="busy" class="auth-fields">
            <div class="auth-field">
              <Label for="email">邮箱</Label>
              <Input id="email" v-model="email" type="email" autocomplete="email" list="email-suggestions" placeholder="name@example.com" required />
              <datalist id="email-suggestions">
                <option v-for="suggestion in emailSuggestions" :key="suggestion" :value="suggestion" />
              </datalist>
            </div>
            <div v-if="mode !== 'login'" class="auth-field">
              <Label for="code">邮箱验证码</Label>
              <div class="auth-code-row">
                <Input id="code" v-model="code" autocomplete="one-time-code" placeholder="输入验证码" required class="min-w-0" /><Button type="button" variant="outline" :disabled="sending || seconds > 0" @click="sendCode">
                  {{ sending ? '发送中…' : seconds ? `${seconds} 秒后重发` : '获取验证码' }}
                </Button>
              </div>
            </div>
            <div class="auth-field">
              <div class="auth-label-row">
                <Label for="password">{{ mode === 'reset' ? '新密码' : '密码' }}</Label>
                <RouterLink v-if="mode === 'login'" :to="{ path: '/user/password/reset', query }" class="auth-link text-muted-foreground hover:text-foreground">
                  忘记密码？
                </RouterLink>
              </div>
              <div class="auth-password">
                <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" required :placeholder="mode === 'login' ? '输入密码' : '8–16 位英文字母或数字'" />
                <Button type="button" variant="ghost" size="icon" class="auth-password-toggle text-muted-foreground" :aria-label="showPassword ? '隐藏密码' : '显示密码'" :aria-pressed="showPassword" aria-controls="password" @click="showPassword = !showPassword">
                  <EyeOff v-if="showPassword" class="size-4" aria-hidden="true" />
                  <Eye v-else class="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <div v-if="mode !== 'login'" class="auth-field">
              <Label for="confirmation">确认密码</Label>
              <div class="auth-password">
                <Input id="confirmation" v-model="confirmation" :type="showConfirmation ? 'text' : 'password'" autocomplete="new-password" required placeholder="再次输入密码" />
                <Button type="button" variant="ghost" size="icon" class="auth-password-toggle text-muted-foreground" :aria-label="showConfirmation ? '隐藏确认密码' : '显示确认密码'" :aria-pressed="showConfirmation" aria-controls="confirmation" @click="showConfirmation = !showConfirmation">
                  <EyeOff v-if="showConfirmation" class="size-4" aria-hidden="true" />
                  <Eye v-else class="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <p v-if="error" role="alert" class="text-sm text-destructive">
              {{ error }}
            </p>
            <Button type="submit" class="w-full" :disabled="busy || sending">
              <Loader2 v-if="busy" class="size-4 animate-spin" />{{ busy ? '处理中…' : action }}
            </Button>
          </fieldset>
        </form>
        <template v-if="mode === 'login' && showWechatLogin">
          <div class="auth-divider text-muted-foreground">
            <span class="bg-border" />其他登录方式<span class="bg-border" />
          </div>
          <Button variant="outline" class="w-full" :disabled="busy" @click="wechat">
            <MessageCircle class="size-4 text-green-600" />微信扫码登录
          </Button>
        </template>
      </CardContent>
      <CardFooter class="auth-footer text-muted-foreground">
        {{ mode === 'login' ? '还没有账户？' : '已有账户？' }}
        <RouterLink :to="{ path: mode === 'login' ? '/user/sign/up' : '/user/sign/in', query }" class="font-medium text-primary">
          {{ mode === 'login' ? '注册' : '返回登录' }}
        </RouterLink>
      </CardFooter>
    </Card>
  </div>
</template>

<style scoped>
/* Use gap rather than margins: the legacy global reset overrides Tailwind margin utilities. */
.auth-page {
  display: flex;
  min-height: 100%;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.25rem;
}

.auth-card {
  width: 100%;
  max-width: 28rem;
  gap: 2rem;
  padding: 2rem;
  border-radius: 1rem;
}

.auth-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 0;
  text-align: center;
}

.auth-icon {
  display: flex;
  width: 3rem;
  height: 3rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.875rem;
  margin-bottom: 0.25rem;
}

.auth-title {
  font-size: 1.5rem;
  line-height: 1.35;
  letter-spacing: -0.025em;
}

.auth-description {
  max-width: 22rem;
  font-size: 0.875rem;
  line-height: 1.7;
  text-wrap: balance;
}

.auth-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0;
}

.auth-fields {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 1.5rem;
}

.auth-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.625rem;
}

.auth-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.auth-password {
  position: relative;
}

.auth-password :deep(input) {
  padding-right: 3rem;
}

.auth-password-toggle {
  position: absolute;
  top: 0;
  right: 0;
  width: 2.75rem;
  height: 100%;
}

.auth-link {
  font-size: 0.8125rem;
  line-height: 1.5;
}

.auth-code-row {
  display: flex;
  gap: 0.75rem;
}

.auth-code-row > button {
  flex-shrink: 0;
}

.auth-content :deep(input),
.auth-content :deep(button) {
  min-height: 2.75rem;
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  line-height: 1.5;
}

.auth-divider > span {
  height: 1px;
  flex: 1;
}

.auth-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.375rem;
  padding: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

@media (max-width: 480px) {
  .auth-page {
    padding: 1.25rem 1rem;
  }

  .auth-card {
    padding: 1.5rem;
    gap: 1.75rem;
  }
}

@media (max-width: 360px) {
  .auth-code-row {
    flex-direction: column;
  }
}
</style>
