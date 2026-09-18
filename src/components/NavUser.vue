<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronsUpDown, Loader2, LogOut, RefreshCw, UserRound } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { UserDataRepository } from '@/data/repository/UserDataRepository'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { useUserStore } from '@/stores/useUserStore'
import { useSyncStore } from '@/stores/useSyncStore'

const store = useUserStore()
const syncStore = useSyncStore()
const router = useRouter()
const { isMobile, setOpenMobile } = useSidebar()
const user = computed(() => {
  const account = store.user
  return {
    name: account?.nick || account?.email?.split('@')[0] || account?.phone || (account ? 'iTime 用户' : '未登录'),
    avatar: account?.avatar || '',
  }
})
const showLogoutDialog = ref(false)
const keepData = ref(true)
function openAccount() {
  setOpenMobile(false)
  router.push(store.isLogin ? '/user/profile' : '/user/sign/in')
}
async function clearAllLocalData() {
  await UserDataRepository.clear()
  await PomodoroHistoryRepository.clear()
  await PomodoroSceneRepository.clear()
}
async function doSignOut(preserveData: boolean) {
  try {
    if (!preserveData) {
      await clearAllLocalData()
    }
    await store.logout()
  }
  catch { /* Local session is already cleared. */ }
  router.push('/user/sign/in')
}
function confirmSignOut() {
  keepData.value = true
  showLogoutDialog.value = true
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton size="lg" class="data-[state=open]:bg-sidebar-accent">
            <Avatar class="size-8 rounded-lg">
              <AvatarImage v-if="user.avatar" :src="user.avatar" :alt="user.name" />
              <AvatarFallback class="rounded-lg">
                <UserRound class="size-4" aria-hidden="true" />
              </AvatarFallback>
            </Avatar>
            <div class="grid min-w-0 flex-1 gap-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{{ user.name }}</span>
              <span v-if="syncStore.syncing" role="status" class="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 class="size-3 shrink-0 animate-spin" aria-hidden="true" />
                正在同步
              </span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="min-w-56 rounded-lg" :side="isMobile ? 'top' : 'right'" align="end" :side-offset="4">
          <DropdownMenuItem @select="openAccount">
            <UserRound aria-hidden="true" />
            {{ store.isLogin ? '账户信息' : '登录 / 注册' }}
          </DropdownMenuItem>
          <DropdownMenuItem v-if="store.isLogin" :disabled="syncStore.syncing" @select="syncStore.sync()">
            <RefreshCw :class="{ 'animate-spin': syncStore.syncing }" aria-hidden="true" />
            {{ syncStore.syncing ? '同步中…' : '同步' }}
          </DropdownMenuItem>
          <DropdownMenuItem v-if="store.isLogin" @select="confirmSignOut()">
            <LogOut aria-hidden="true" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
  <AlertDialog v-model:open="showLogoutDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>退出登录</AlertDialogTitle>
        <AlertDialogDescription>
          <label class="flex cursor-pointer items-center gap-3 py-2">
            <Checkbox v-model="keepData" />
            <span>保留本地数据（待办、倒计时、生日、番茄场景与记录）</span>
          </label>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction
          :class="keepData ? undefined : 'bg-destructive text-white hover:bg-destructive/90'"
          @click="doSignOut(keepData)"
        >
          确认退出
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
