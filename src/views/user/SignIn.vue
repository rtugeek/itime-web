<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from '@nutui/nutui'
import consola from 'consola'
import SmsCodeButton from '@/components/form/SmsCodeButton.vue'
import { delay } from '@/utils/TimeUtils'

const formRef = ref()
const formData = ref({
  phone: '',
  password: '',
  code: '',
})

const loginType = ref<'password' | 'sms'>('password')
function signIn() {
  showToast.loading('登录中')
  formRef.value?.validate().then(async ({ valid, errors }) => {
    if (valid) {
      consola.log('success:', formData.value)
    }
    else {
      consola.warn('error:', errors)
    }
    await delay(3000)
    showToast.hide()
  })
}

const rules = {
  phone: [
    { regex: /^1[3-9]\d{9}$/, message: '请输入正确手机号' },
  ],
  code: [
    { regex: /\d{4}/, message: '请输入正确验证码' },
  ],
}
</script>

<template>
  <div class="flex flex-col gap-2 p-4">
    <nut-form ref="formRef" :rules="rules" :model-value="formData">
      <nut-form-item label="手机号" prop="phone">
        <nut-input v-model="formData.phone" placeholder="请输入手机号" type="text" />
      </nut-form-item>
      <nut-form-item v-if="loginType == 'password'" label="密码" prop="password">
        <nut-input v-model="formData.password" placeholder="8-16位，必须包含字母和数字" type="text">
          <template #right>
            <nut-button size="small" @click="loginType = 'sms'">
              验证码登录
            </nut-button>
          </template>
        </nut-input>
      </nut-form-item>
      <nut-form-item v-if="loginType == 'sms'" label="验证码" prop="password">
        <nut-input v-model="formData.password" placeholder="请输入验证码" type="text">
          <template #right>
            <div class="flex gap-2">
              <nut-button size="small" @click="loginType = 'password'">
                密码登录
              </nut-button>
              <SmsCodeButton />
            </div>
          </template>
        </nut-input>
      </nut-form-item>
    </nut-form>
    <div class="flex gap-4">
      <router-link class="flex-1 w-full" :to="{ name: 'UserSignUp' }">
        <nut-button style="width:100%">
          注册
        </nut-button>
      </router-link>
      <nut-button class="flex-1" type="primary" @click="signIn">
        登录
      </nut-button>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
