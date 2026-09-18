<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { consumeWechatState, safeRedirect } from '@/common/wechatAuth'
import { useUserStore } from '@/stores/useUserStore'

const route = useRoute()
const router = useRouter()
const store = useUserStore()
const error = ref('')
onMounted(async () => {
  const code = typeof route.query.code === 'string' ? route.query.code : ''
  const state = typeof route.query.state === 'string' ? route.query.state : ''
  await router.replace({ path: route.path })
  try {
    const saved = consumeWechatState(state)
    if (!code) { throw new Error('微信授权已取消，请重新登录') }
    await store.loginByWechat(code, saved.appId)
    await router.replace(safeRedirect(saved.redirect))
  }
  catch (e) { error.value = e instanceof Error ? e.message : '微信登录失败，请重新登录' }
})
</script>

<template>
  <div class="mx-auto max-w-md space-y-5 p-8 text-center">
    <h1 class="text-2xl font-semibold">
      微信登录
    </h1>
    <p :role="error ? 'alert' : 'status'" class="text-sm text-muted-foreground">
      {{ error || '正在完成微信授权，请稍候…' }}
    </p>
    <Button v-if="error" as-child>
      <RouterLink to="/user/sign/in">
        返回登录
      </RouterLink>
    </Button>
  </div>
</template>
