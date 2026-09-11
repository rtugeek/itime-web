<script setup lang="ts">
import { computed } from 'vue'
import { AppApi } from '@widget-js/core'
import { ChevronsUpDown, Loader2, Settings, UserRound } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { isSyncing } from '@/common/syncStatus'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { useSupabaseStore } from '@/stores/useSupabaseStore'

const store = useSupabaseStore()
const router = useRouter()
const { isMobile, setOpenMobile } = useSidebar()
const user = computed(() => {
  const account = store.user
  const metadata = account?.user_metadata
  return {
    name: metadata?.nickname || metadata?.name || metadata?.full_name || account?.email?.split('@')[0] || account?.phone || (account ? 'iTime 用户' : '未登录'),
    avatar: metadata?.avatar_url || metadata?.avatar || '',
  }
})
function openAccount() {
  setOpenMobile(false)
  AppApi.showAppWindow('/user/profile')
}
function openSettings() {
  setOpenMobile(false)
  router.push('/settings')
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
              <span v-if="isSyncing" role="status" class="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 class="size-3 shrink-0 animate-spin" aria-hidden="true" />
                正在同步
              </span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="min-w-56 rounded-lg" :side="isMobile ? 'top' : 'right'" align="end" :side-offset="4">
          <DropdownMenuItem @select="openAccount">
            <UserRound />
            {{ store.isLogin ? '账户信息' : '登录 / 注册' }}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @select="openSettings">
            <Settings />
            设置
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
