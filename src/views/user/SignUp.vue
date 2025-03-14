<script setup lang="ts">
import { ref } from 'vue'
import type { Form } from '@nutui/nutui'
import { showToast } from '@nutui/nutui'
import consola from 'consola'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import SmsFormItem from '@/components/form/SmsFormItem.vue'
import { UserApi } from '@/api/UserApi'

const formData = ref({
  phone: '',
  password: '',
  confirmPassword: '',
  code: '',
})

const formRef = ref<InstanceType<typeof Form>>()
const userStore = useUserStore()
const rules = {
  phone: [
    { regex: /^1[3-9]\d{9}$/, message: '请输入正确手机号' },
  ],
  code: [
    { regex: /\d{4}/, message: '请输入正确验证码' },
  ],
  password: [
    { regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/, message: '密码为8-16位，必须包含字母和数字' },
  ],
  confirmPassword: [
    {
      validator: (value: string) => {
        if (value !== formData.value.password) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('两次密码不一致')
        }
        return Promise.resolve()
      },
    },
  ],
}

const router = useRouter()
async function signUp() {
  showToast.loading('注册中')
  formRef.value?.validate().then(async ({ valid, errors }) => {
    if (valid) {
      const user = await userStore.register(formData.value.phone, formData.value.password, formData.value.code)
      if (user) {
        router.push({ name: 'Settings' })
        formRef.value?.reset()
      }
    }
    else {
      consola.warn('error:', errors)
    }
    showToast.hide()
  })
}

function checkPhoneUsed() {
  const phone = formData.value.phone
  if (!phone.length || phone.length < 11) {
    return
  }
  UserApi.isPhoneUsed(phone).then((used) => {
    if (used) {
      showToast.warn(`${phone}已被注册`, { duration: 5000 })
    }
  })
}
</script>

<template>
  <div class="flex flex-col gap-2 p-4">
    <nut-form ref="formRef" :rules="rules" :model-value="formData">
      <nut-form-item label="手机号" prop="phone" label-width="80">
        <nut-input v-model="formData.phone" placeholder="请输入手机号" type="text" @blur="checkPhoneUsed" />
      </nut-form-item>
      <SmsFormItem v-model="formData.code" :phone="formData.phone" />
      <nut-form-item label="密码" prop="password" label-width="80">
        <nut-input v-model="formData.password" placeholder="8-16位，必须包含字母和数字" type="password" />
      </nut-form-item>
      <nut-form-item label="确认密码" prop="confirmPassword" label-width="80">
        <nut-input v-model="formData.confirmPassword" placeholder="请确认密码" type="password" />
      </nut-form-item>
    </nut-form>
    <div class="flex gap-4">
      <nut-button class="flex-1" type="primary" @click="signUp">
        注册
      </nut-button>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
