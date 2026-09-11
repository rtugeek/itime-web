<script setup lang="ts">
import { toast } from 'vue-sonner'
import consola from 'consola'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import SmsFormItem from '@/components/form/SmsFormItem.vue'
import { useUserStore } from '@/stores/useUserStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FormItem, FormMessage } from '@/components/ui/form'

const userStore = useUserStore()
const router = useRouter()

const phoneRegex = /^1[3-9]\d{9}$/

const schema = toTypedSchema(
  z.object({
    phone: z.string().refine(val => phoneRegex.test(val), '请输入正确手机号'),
    code: z.string().refine(val => /\d{4}/.test(val), '请输入短信验证码'),
  }),
)

const { handleSubmit, values, errors, defineField } = useForm({
  validationSchema: schema,
  initialValues: {
    phone: userStore.latestUsername ?? '',
    code: '',
  },
})

const [phone, phoneAttrs] = defineField('phone')
const [code] = defineField('code')

const signIn = handleSubmit(async () => {
  const loadingId = toast.loading('登录中')
  try {
    const user = await userStore.loginBySms(values.phone!, values.code!)
    if (user) {
      toast.dismiss(loadingId)
      router.push({ name: 'Settings' })
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
    </div>
    <div class="flex flex-col gap-4">
      <Button class="w-full" @click="signIn">
        登录
      </Button>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
