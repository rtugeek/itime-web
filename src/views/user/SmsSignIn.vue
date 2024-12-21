<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from '@nutui/nutui'
import consola from 'consola'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import SmsFormItem from '@/components/form/SmsFormItem.vue'

const userStore = useUserStore()
const router = useRouter()
const formRef = ref()
const formData = ref({
  phone: userStore.latestUsername,
  captchaCode: '',
  code: '',
})

function signIn() {
  showToast.loading('登录中')
  formRef.value?.validate().then(async ({ valid, errors }) => {
    if (valid) {
      userStore.loginBySms(formData.value.phone, formData.value.code).then((user) => {
        if (user) {
          router.push({ name: 'Settings' })
        }
      })
    }
    else {
      consola.warn('error:', errors)
    }
    showToast.hide()
  })
}

const rules = {
  phone: [
    { regex: /^1[3-9]\d{9}$/, message: '请输入正确手机号' },
  ],
  code: [
    { regex: /\d{4}/, message: '请输入短信验证码' },
  ],
}
</script>

<template>
  <div class="flex flex-col gap-2 p-4">
    <nut-form ref="formRef" :rules="rules" :model-value="formData">
      <nut-form-item label="手机号" prop="phone" label-width="80">
        <nut-input v-model="formData.phone" placeholder="请输入手机号" type="text" />
      </nut-form-item>
      <SmsFormItem v-model="formData.code" :phone="formData.phone" />
    </nut-form>
    <div class="flex flex-col gap-4">
      <nut-button class="flex-1" type="primary" @click="signIn">
        登录
      </nut-button>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
