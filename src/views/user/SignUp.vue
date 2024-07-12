<script setup lang="ts">
import { ref } from 'vue'
import type { Form } from '@nutui/nutui'
import { showToast } from '@nutui/nutui'
import consola from 'consola'
import SmsCodeButton from '@/components/form/SmsCodeButton.vue'

const formData = ref({
  phone: '',
  password: '',
  confirmPassword: '',
  code: '',
})

const formRef = ref<InstanceType<typeof Form>>()

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
}

async function signUp() {
  showToast.loading('注册中')
  formRef.value?.validate().then(({ valid, errors }) => {
    if (valid) {
      consola.log('success:', formData.value)
    }
    else {
      consola.warn('error:', errors)
    }
  })
}
</script>

<template>
  <div class="flex flex-col gap-2 p-4">
    <nut-form ref="formRef" :rules="rules" :model-value="formData">
      <nut-form-item label="手机号" prop="phone">
        <nut-input v-model="formData.phone" placeholder="请输入手机号" type="text" />
      </nut-form-item>
      <nut-form-item label="验证码" prop="code">
        <nut-input v-model="formData.code" placeholder="请输入验证码" type="text">
          <template #right>
            <SmsCodeButton />
          </template>
        </nut-input>
      </nut-form-item>
      <nut-form-item label="密码" prop="password">
        <nut-input v-model="formData.password" placeholder="8-16位，必须包含字母和数字" type="text" />
      </nut-form-item>
      <nut-form-item label="确认密码" prop="confirmPassword">
        <nut-input v-model="formData.confirmPassword" placeholder="请确认密码" type="text" />
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
