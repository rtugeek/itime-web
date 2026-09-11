<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Mail, Phone, Wechat } from '@icon-park/vue-next'
import consola from 'consola'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useUserStore } from '@/stores/useUserStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FormItem, FormMessage } from '@/components/ui/form'

const { t } = useI18n()
const userStore = useUserStore()
const router = useRouter()

const phoneRegex = /^1[3-9]\d{9}$/

const schema = toTypedSchema(
  z.object({
    phone: z.string().refine(val => phoneRegex.test(val), t('signIn.validation.phoneFormat')),
    password: z.string().min(1, t('signIn.validation.passwordRequired')),
  }),
)

const { handleSubmit, values, errors, defineField } = useForm({
  validationSchema: schema,
  initialValues: {
    phone: userStore.latestUsername ?? '',
    password: '',
  },
})

const [phone, phoneAttrs] = defineField('phone')
const [password, passwordAttrs] = defineField('password')

const signIn = handleSubmit(async () => {
  const loadingId = toast.loading(t('signIn.signingIn'))
  try {
    const user = await userStore.loginByPassword(values.phone!, values.password!)
    if (user) {
      toast.dismiss(loadingId)
      router.back()
    }
    else {
      toast.dismiss(loadingId)
    }
  }
  catch (e) {
    consola.warn('error:', e)
    toast.dismiss(loadingId)
  }
})

function otherSignIn(type: 'sms' | 'wechat' | 'mail') {
  if (type == 'sms') {
    router.push({ name: 'SmsSignIn' })
  }
  else {
    toast.warning(t('signIn.inDevelopment'))
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="space-y-4">
      <FormItem>
        <Label>{{ t('signIn.phone') }}</Label>
        <Input
          v-model="phone"
          :placeholder="t('signIn.phonePlaceholder')"
          type="text"
          v-bind="phoneAttrs"
        />
        <FormMessage v-if="errors.phone">
          {{ errors.phone }}
        </FormMessage>
      </FormItem>
      <FormItem>
        <Label>{{ t('signIn.password') }}</Label>
        <Input
          v-model="password"
          :placeholder="t('signIn.passwordPlaceholder')"
          type="password"
          v-bind="passwordAttrs"
        />
        <FormMessage v-if="errors.password">
          {{ errors.password }}
        </FormMessage>
      </FormItem>
    </div>
    <div class="flex flex-col gap-4">
      <Button class="w-full" @click="signIn">
        {{ t('signIn.signInButton') }}
      </Button>
      <router-link class="w-full" :to="{ name: 'UserSignUp' }">
        <Button variant="outline" class="w-full">
          {{ t('signIn.signUpButton') }}
        </Button>
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
  display: flex;
  align-items: center;
  justify-content: center;
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
