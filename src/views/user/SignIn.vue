<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from '@nutui/nutui'
import { Mail, Phone, Wechat } from '@icon-park/vue-next'
import consola from 'consola'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const userStore = useUserStore()
const router = useRouter()
const formRef = ref()
const formData = ref({
  phone: userStore.latestUsername,
  password: '',
  code: '',
})
function signIn() {
  showToast.loading(t('signIn.signingIn'))
  formRef.value?.validate().then(async ({ valid, errors }) => {
    if (valid) {
      const user = await userStore.loginByPassword(formData.value.phone, formData.value.password)
      if (user) {
        router.back()
      }
    }
    else {
      consola.warn('error:', errors)
    }
    showToast.hide()
  })
}

function otherSignIn(type: 'sms' | 'wechat' | 'mail') {
  if (type == 'sms') {
    router.push({ name: 'SmsSignIn' })
  }
  else {
    showToast.warn(t('signIn.inDevelopment'))
  }
}

const rules = {
  phone: [
    { regex: /^1[3-9]\d{9}$/, message: t('signIn.validation.phoneFormat') },
  ],
  code: [
    { regex: /\d{4}/, message: t('signIn.validation.codeFormat') },
  ],
}
</script>

<template>
  <div class="flex flex-col gap-2 p-4">
    <nut-form ref="formRef" :rules="rules" :model-value="formData">
      <nut-form-item :label="t('signIn.phone')" prop="phone" label-width="50">
        <nut-input
          v-model="formData.phone"
          :placeholder="t('signIn.phonePlaceholder')"
          type="text"
        />
      </nut-form-item>
      <nut-form-item label-width="50" :label="t('signIn.password')" prop="password">
        <nut-input
          v-model="formData.password"
          :placeholder="t('signIn.passwordPlaceholder')"
          type="password"
        />
      </nut-form-item>
    </nut-form>
    <div class="flex flex-col gap-4">
      <nut-button class="flex-1" type="primary" @click="signIn">
        {{ t('signIn.signInButton') }}
      </nut-button>
      <router-link class="flex-1" :to="{ name: 'UserSignUp' }">
        <nut-button style="width:100%">
          {{ t('signIn.signUpButton') }}
        </nut-button>
      </router-link>
    </div>
    <div class="sso flex w-full items-center gap-4 justify-center mt-8">
      <div class="line" />
      <div class="icon" @click="otherSignIn('sms')">
        <Phone size="20" />
      </div>
      <div class="icon disable" @click="otherSignIn('mail')">
        <Mail size="20" />
      </div>
      <div class="icon disable" @click="otherSignIn('wechat')">
        <Wechat size="20" />
      </div>
      <div class="line" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.icon {
  cursor: pointer;
  width: 32px;
  height: 32px;
  &.disable{
    background: darkgrey;
  }
  background: #478EF2;
  border-radius: 50%;
  color: white;
}
.sso{
  .line{
    width: 24px;
    height: 1px;
    border-radius: 50%;
    background: rgba(145, 145, 145, 0.55);
  }
}
</style>
