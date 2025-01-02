import type { DefaultLocaleMessageSchema } from 'vue-i18n'

export const userMessage: DefaultLocaleMessageSchema = {
  zh: {
    user: {
      signOut: '退出登录',
      signIn: '登录',
    },
    signIn: {
      title: '登录',
      phone: '手机号',
      phonePlaceholder: '请输入手机号',
      password: '密码',
      passwordPlaceholder: '8-16位，必须包含字母和数字',
      signInButton: '登录',
      signUpButton: '注册',
      signingIn: '登录中',
      inDevelopment: '开发中',
      validation: {
        phoneFormat: '请输入正确手机号',
        codeFormat: '请输入正确验证码'
      }
    }
  },
  en: {
    user: {
      signOut: 'Sign Out',
      signIn: 'Sign In',
    },
    signIn: {
      title: 'Sign In',
      phone: 'Phone',
      phonePlaceholder: 'Please enter phone number',
      password: 'Password',
      passwordPlaceholder: 'Must be 8-16 characters with letters and numbers',
      signInButton: 'Sign In',
      signUpButton: 'Sign Up',
      signingIn: 'Signing in...',
      inDevelopment: 'In development',
      validation: {
        phoneFormat: 'Please enter a valid phone number',
        codeFormat: 'Please enter a valid verification code'
      }
    }
  },
}
