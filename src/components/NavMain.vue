<script setup lang="ts">
import type { LucideIcon } from '@lucide/vue'
import { RouterLink, useRoute } from 'vue-router'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'

defineProps<{ items: { title: string, url: string, icon?: LucideIcon }[] }>()
const route = useRoute()
const { setOpenMobile } = useSidebar()
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>我的时间</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem v-for="item in items" :key="item.url">
        <SidebarMenuButton as-child :tooltip="item.title" :is-active="route.path === item.url || route.path.startsWith(`${item.url}/`)">
          <RouterLink :to="item.url" @click="setOpenMobile(false)">
            <component :is="item.icon" v-if="item.icon" />
            <span>{{ item.title }}</span>
          </RouterLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
