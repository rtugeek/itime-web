<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SmsCodeButton from '@/components/form/SmsCodeButton.vue'
import { useToastLoading } from '@/common/composition/useToastLoading'
import { CaptchaApi, type CaptchaResult } from '@/api/CaptchaApi'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InputGroup } from '@/components/ui/input-group'

defineProps({
  phone: {
    type: String,
    required: true,
  },
})
const { t } = useI18n()
const captchaCode = ref('')
const captchaResult = ref<CaptchaResult>()
const model = defineModel({ type: String })

function loadCaptcha() {
  useToastLoading(async () => {
    captchaResult.value = await CaptchaApi.get()
  }, { message: t('loading'), id: 'get-captcha' })
}

const captchaImg = computed(() => {
  if (captchaResult.value?.img) {
    return `data:image/png;base64,${captchaResult.value.img}`
  }
  return ''
})

onMounted(() => {
  loadCaptcha()
})
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <Label>图片验证码</Label>
      <InputGroup>
        <Input v-model="captchaCode" placeholder="请输入验证码" type="text" class="pr-24" />
        <div class="absolute right-2 top-1/2 -translate-y-1/2">
          <img class="cursor-pointer h-8 rounded" :src="captchaImg" width="80" @click="loadCaptcha()">
        </div>
      </InputGroup>
    </div>
    <div class="space-y-2">
      <Label>短信验证码</Label>
      <InputGroup>
        <Input v-model="model" placeholder="请输入验证码" type="text" class="pr-32" />
        <div class="absolute right-2 top-1/2 -translate-y-1/2">
          <SmsCodeButton :phone="phone" :captcha-uuid="captchaResult?.uuid" :image-code="captchaCode" @on-failed="loadCaptcha" />
        </div>
      </InputGroup>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
