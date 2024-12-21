<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SmsCodeButton from '@/components/form/SmsCodeButton.vue'
import { useToastLoading } from '@/common/composition/useToastLoading'
import { CaptchaApi, type CaptchaResult } from '@/api/CaptchaApi'

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
  <nut-form-item label-width="80" label="图片验证码" prop="captchaCode">
    <nut-input v-model="captchaCode" placeholder="请输入验证码" type="text">
      <template #right>
        <img class="cursor-pointer" :src="captchaImg" width="80" @click="loadCaptcha()">
      </template>
    </nut-input>
  </nut-form-item>
  <nut-form-item label-width="80" label="短信验证码" prop="code">
    <nut-input v-model="model" placeholder="请输入验证码" type="text">
      <template #right>
        <div class="flex gap-2">
          <SmsCodeButton :phone="phone" :captcha-uuid="captchaResult?.uuid" :image-code="captchaCode" @on-failed="loadCaptcha" />
        </div>
      </template>
    </nut-input>
  </nut-form-item>
</template>

<style scoped lang="scss">

</style>
