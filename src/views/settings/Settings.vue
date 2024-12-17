<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Android, Apple, User } from '@icon-park/vue-next'
import { showDialog } from '@nutui/nutui'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { BrowserWindowApi } from '@widget-js/core'
import PomodoroSettings from '@/views/settings/PomodoroSettings.vue'
import { useUserStore } from '@/stores/useUserStore'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const { t } = useI18n()
const router = useRouter()
function logout() {
  showDialog({
    title: '确认退出账号？',
    content: '退出账号后，数据将不再同步',
    onCancel: () => {},
    onOk: () => {
      userStore.logout()
    },
  })
}

function profileClick() {
  if (!user.value) {
    router.push({ name: 'UserSignIn' })
  }
}

function viewApp() {
  BrowserWindowApi.openUrl('https://itime.fun/', { external: true })
}
</script>

<template>
  <div class="flex flex-col">
    <NutCell class="cursor-pointer" @click="profileClick">
      <div class="flex gap-2 items-center w-full">
        <template v-if="user">
          <nut-avatar shape="round">
            <img v-if="user!.avatar" :src="user!.avatar">     <User v-else />
          </nut-avatar>
          <span>{{ user.nick }}</span>
          <nut-button class="ml-auto" size="small" @click="logout">
            {{ t('user.signOut') }}
          </nut-button>
        </template>
        <template v-else>
          <nut-avatar shape="round">
            <User />
          </nut-avatar>
          <span>{{ t('user.signIn') }}</span>
        </template>
      </div>
    </NutCell>
    {{ t('pomodoro.settings') }}
    <PomodoroSettings />
    <div class="flex items-center gap-2">{{t('app.download')}} <Android /> /  <Apple /></div>
    <NutCell>
      <div class="flex gap-2 items-center w-full">
        <nut-avatar shape="round">
          <img src="@/assets/logo.png">
        </nut-avatar>
        <span>iTime</span>
        <nut-button class="ml-auto" size="small" @click="viewApp">
          {{t('view')}}
        </nut-button>
      </div>
    </NutCell>
  </div>
</template>

<style scoped lang="scss">

</style>
