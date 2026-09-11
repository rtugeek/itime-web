<script lang="ts" setup>
import { computed } from 'vue'
import { Clock, Hourglass, Settings, Timer } from '@lucide/vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from '@/components/ui/sidebar'

const route = useRoute()
const { t } = useI18n()

const navItems = computed(() => [
  {
    title: t('countdown.title'),
    url: '/countdown',
    icon: Hourglass,
  },
  {
    title: t('pomodoro.title'),
    url: '/pomodoro',
    icon: Timer,
  },
  {
    title: t('settings'),
    url: '/settings',
    icon: Settings,
  },
])

const data = {
  app: {
    name: 'iTime',
    logo: Clock,
    description: '时间管理',
  },
}
</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" as-child>
              <RouterLink to="/countdown">
                <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <component :is="data.app.logo" class="size-4" />
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-medium">{{ data.app.name }}</span>
                  <span class="truncate text-xs">{{ data.app.description }}</span>
                </div>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{{ t('settings') }}</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in navItems" :key="item.url">
              <SidebarMenuButton
                as-child
                :is-active="route.path === item.url || route.path.startsWith(`${item.url}/`)"
                :tooltip="item.title"
              >
                <RouterLink :to="item.url">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
    <SidebarInset>
      <div class="flex min-h-svh flex-1 flex-col">
        <RouterView v-slot="{ Component }">
          <component :is="Component" />
        </RouterView>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<style scoped>
</style>
