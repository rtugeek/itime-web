<script setup lang="ts">
import { useIntervalFn, useStorage } from '@vueuse/core'
import { nextTick, onMounted, ref } from 'vue'
import { showNotify, showToast } from '@nutui/nutui'
import { AppConfig } from '@/common/AppConfig'
import { UserApi } from '@/api/UserApi'
import { SmsApi } from '@/api/SmsApi'

const props = defineProps({
  phone: {
    type: String,
    required: true,
  },
})
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
const countdownText = ref(`60`)
async function getCode() {
  // 检测是否是有效手机
  if (!/^1[3-9]\d{9}$/.test(props.phone)) {
    showNotify.danger('请输入正确手机号')
    return
  }
  showToast.loading('请等待')
  const isPhoneUsed = await UserApi.isPhoneUsed(props.phone)
  if (isPhoneUsed) {
    showNotify.danger('手机号已被注册')
    showToast.hide()
    return
  }
  await SmsApi.getCode(props.phone)
  showNotify.success('验证码已发送')
  countdownText.value = '60'
  countdown.value = new Date()
  showToast.hide()
  resume()
}

const { resume } = useIntervalFn(() => {
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

onMounted(async () => {
  await nextTick()
  if (countdown.value != undefined) {
    resume()
  }
})
</script>

<template>
  <nut-button :disabled="countdown != undefined" size="small" @click="getCode">
    {{ countdown == undefined ? '获取验证码' : countdownText }}
  </nut-button>
</template>

<style scoped lang="scss">

</style>
