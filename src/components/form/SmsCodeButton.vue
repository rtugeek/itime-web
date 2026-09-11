<script setup lang="ts">
import { useIntervalFn, useStorage } from '@vueuse/core'
import { nextTick, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { AppConfig } from '@/common/AppConfig'
import { SmsApi } from '@/api/SmsApi'
import { Button } from '@/components/ui/button'

const props = defineProps({
  phone: {
    type: String,
    required: true,
  },
  captchaUuid: {
    type: String,
  },
  imageCode: {
    type: String,
  },
})

const emits = defineEmits(['onFailed'])
const countdownText = ref(`60`)
const countdown = useStorage<Date | undefined>(AppConfig.KEY_GET_SMS_CODE_TIME, undefined, undefined, {
  serializer: {
    read(str) {
      if (str == '') {
        return undefined
      }
      return new Date(str)
    },
    write(date) {
      if (date == undefined) {
        return ''
      }
      return date.toISOString()
    },
  },
})

const { resume: startCountdown } = useIntervalFn(() => {
  if (countdown.value) {
    const now = new Date()
    const diff = now.getTime() - countdown.value.getTime()
    if (diff >= 60 * 1000) {
      countdown.value = undefined
    }
    else {
      countdownText.value = `${60 - Math.floor(diff / 1000)}`
    }
  }
}, 1000, { immediate: false })

async function getCode() {
  if (!props.imageCode) {
    toast.error('请先输入图片验证码')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(props.phone)) {
    toast.error('请输入正确手机号')
    return
  }
  const loadingId = toast.loading('请等待')
  SmsApi.getCode(props.phone, props.imageCode, props.captchaUuid).then(() => {
    toast.success('验证码已发送', { id: loadingId })
    countdownText.value = '60'
    countdown.value = new Date()
    startCountdown()
  }).catch(() => {
    toast.dismiss(loadingId)
    emits('onFailed')
  }).finally(() => {
    toast.dismiss(loadingId)
  })
}

defineExpose({
  startCountdown,
})

onMounted(async () => {
  await nextTick()
  if (countdown.value != undefined) {
    startCountdown()
  }
})
</script>

<template>
  <Button :disabled="countdown != undefined" variant="outline" size="sm" class="whitespace-nowrap" @click="getCode">
    {{ countdown == undefined ? '获取验证码' : countdownText }}
  </Button>
</template>

<style scoped lang="scss">
</style>
