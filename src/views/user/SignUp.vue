<script setup lang="ts">
import { toast } from 'vue-sonner'
import consola from 'consola'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useUserStore } from '@/stores/useUserStore'
import SmsFormItem from '@/components/form/SmsFormItem.vue'
import { UserApi } from '@/api/UserApi'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FormItem, FormMessage } from '@/components/ui/form'

const userStore = useUserStore()
const router = useRouter()

const phoneRegex = /^1[3-9]\d{9}$/
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Z\d]{8,16}$/i

const schema = toTypedSchema(
  z.object({
    phone: z.string().refine(val => phoneRegex.test(val), '请输入正确手机号'),
    code: z.string().refine(val => /\d{4}/.test(val), '请输入正确验证码'),
    password: z.string().refine(val => passwordRegex.test(val), '密码为8-16位，必须包含字母和数字'),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: '两次密码不一致',
    path: ['confirmPassword'],
  }),
)

const { handleSubmit, values, errors, defineField, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    phone: '',
    password: '',
    confirmPassword: '',
    code: '',
  },
})

const [phone, phoneAttrs] = defineField('phone')
const [code] = defineField('code')
const [password, passwordAttrs] = defineField('password')
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword')

const signUp = handleSubmit(async () => {
  const loadingId = toast.loading('注册中')
  try {
    const user = await userStore.register(values.phone!, values.password!, values.code!)
    if (user) {
      toast.dismiss(loadingId)
      router.push({ name: 'Settings' })
      resetForm()
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

function checkPhoneUsed() {
  const phoneValue = values.phone
  if (!phoneValue || !phoneValue.length || phoneValue.length < 11) {
    return
  }
  UserApi.isPhoneUsed(phoneValue).then((used) => {
    if (used) {
      toast.warning(`${phoneValue}已被注册`, { duration: 5000 })
    }
  })
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="space-y-4">
      <FormItem>
        <Label>手机号</Label>
        <Input
          v-model="phone"
          placeholder="请输入手机号"
          type="text"
          v-bind="phoneAttrs"
          @blur="checkPhoneUsed"
        />
        <FormMessage v-if="errors.phone">
          {{ errors.phone }}
        </FormMessage>
      </FormItem>
      <FormItem>
        <SmsFormItem v-model="code" :phone="values.phone ?? ''" />
        <FormMessage v-if="errors.code">
          {{ errors.code }}
        </FormMessage>
      </FormItem>
      <FormItem>
        <Label>密码</Label>
        <Input
          v-model="password"
          placeholder="8-16位，必须包含字母和数字"
          type="password"
          v-bind="passwordAttrs"
        />
        <FormMessage v-if="errors.password">
          {{ errors.password }}
        </FormMessage>
      </FormItem>
      <FormItem>
        <Label>确认密码</Label>
        <Input
          v-model="confirmPassword"
          placeholder="请确认密码"
          type="password"
          v-bind="confirmPasswordAttrs"
        />
        <FormMessage v-if="errors.confirmPassword">
          {{ errors.confirmPassword }}
        </FormMessage>
      </FormItem>
    </div>
    <div class="flex gap-4">
      <Button class="flex-1" @click="signUp">
        注册
      </Button>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
