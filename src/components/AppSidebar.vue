<script setup lang="ts">
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { Cake, Hourglass, ListTodo, Settings, Timer } from '@lucide/vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import pkg from '../../package.json'
import logo from '@/assets/logo.png'
import type { SidebarProps } from '@/components/ui/sidebar'
import TodoListWidget from '@/widgets/todo-list/TodoList.widget'
import DeadlineWidget from '@/widgets/deadline/Deadline.widget'
import CalendarWidget from '@/widgets/calendar/Calendar.widget'
import BirthdayListWidget from '@/widgets/birthday-list/BirthdayList.widget'
import CalendarLargeWidget from '@/widgets/calendar-large/CalendarLarge.widget'
import CountdownListWidget from '@/widgets/countdown-list/CountdownList.widget'
import NavMain from '@/components/NavMain.vue'
import NavUser from '@/components/NavUser.vue'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger } from '@/components/ui/sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import WindowControls from '@/components/window/WindowControls.vue'
import { Toaster } from '@/components/ui/sonner'

const props = withDefaults(defineProps<SidebarProps>(), { collapsible: 'icon' })
const route = useRoute()
const isDark = useDark({ storageKey: null })
const navItems = [
  { title: '代办事项', url: '/todo', icon: ListTodo },
  { title: '倒计时', url: '/countdown', icon: Hourglass },
  { title: '番茄钟', url: '/pomodoro', icon: Timer },
  { title: '生日', url: '/birthday', icon: Cake },
  { title: '设置', url: '/settings', icon: Settings },
]
const noInsetBgRoutes = new Set([
  'UserProfile',
  'UserSignIn',
  'UserSignUp',
  'SmsSignIn',
  'UserWechatCallback',
  'UserPasswordReset',
  'Settings',
  'Countdown',
  'CountdownAdd',
  'Todo',
  'TodoAdd',
  `${TodoListWidget.name}.config`,
  'TodoHistory',
  'Birthday',
  'BirthdayAdd',
  `${BirthdayListWidget.name}.config`,
  'Pomodoro',
  'PomodoroSceneAdd',
  'PomodoroDetail',
  'PomodoroHistory',
  `${CountdownListWidget.name}.config`,
  `${DeadlineWidget.name}.config`,
  `${CalendarWidget.name}.config`,
  `${CalendarLargeWidget.name}.config`,
])
const editRouteTitles: Record<string, string> = {
  CountdownAdd: '编辑倒计时',
  BirthdayAdd: '编辑生日',
  TodoAdd: '编辑待办',
  PomodoroSceneAdd: '编辑场景',
}
const breadcrumbs = computed(() => route.matched
  .filter(record => typeof record.meta.title === 'string')
  .map((record) => {
    const name = String(record.name)
    const isEdit = editRouteTitles[name] && route.query.id
    return {
      path: record.path || '/',
      title: isEdit
        ? editRouteTitles[name]
        : String(record.meta.title),
    }
  }))
</script>

<template>
  <SidebarProvider class="app-shell">
    <Sidebar v-bind="props">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" as-child>
              <RouterLink to="/todo" class="group-data-[collapsible=icon]:justify-center">
                <div class="flex shrink-0 aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                  <img :src="logo" alt="iTime" class="size-full object-cover">
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span class="truncate font-semibold">iTime</span>
                  <span class="truncate text-xs text-muted-foreground">v{{ pkg.version }}</span>
                </div>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain :items="navItems" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <SidebarInset class="min-w-0 overflow-hidden">
      <header class="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger class="app-header-no-drag -ml-1" aria-label="展开或收起侧栏" />
        <!-- Keep the native drag rectangle separate from the window buttons. -->
        <div class="app-header-drag flex h-full min-w-0 flex-1 items-center gap-2 overflow-hidden">
          <Separator orientation="vertical" class="header-separator mr-2" />
          <Breadcrumb class="app-header-no-drag min-w-0">
            <BreadcrumbList class="flex-nowrap gap-1.5 sm:gap-2.5">
              <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
                <BreadcrumbSeparator v-if="index > 0" :class="{ 'breadcrumb-parent': index === 1 }" />
                <BreadcrumbItem class="min-w-0" :class="{ 'breadcrumb-parent': index === 0 }">
                  <BreadcrumbLink v-if="index < breadcrumbs.length - 1" as-child>
                    <RouterLink :to="crumb.path" class="truncate" :title="crumb.title">
                      {{ crumb.title }}
                    </RouterLink>
                  </BreadcrumbLink>
                  <BreadcrumbPage v-else class="truncate" :title="crumb.title">
                    {{ crumb.title }}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <WindowControls :floating="false" class="app-header-no-drag" />
      </header>
      <div class="relative min-h-0 flex-1 overflow-auto p-4 pt-0">
        <div class="relative min-h-full p-4" :class="{ 'rounded-xl bg-muted/50': route.name && !noInsetBgRoutes.has(String(route.name)) }">
          <RouterView :key="route.name === 'UserWechatCallback' ? route.path : route.fullPath" />
        </div>
      </div>
    </SidebarInset>
    <Toaster :theme="isDark ? 'dark' : 'light'" />
  </SidebarProvider>
</template>

<style>
.app-shell {
  height: 100svh;
  min-height: 0;
  overflow: hidden;
}

.app-header-drag {
  -webkit-app-region: drag;
  app-region: drag;
}

.app-header-no-drag {
  -webkit-app-region: no-drag;
  app-region: no-drag;
}
.app-shell .header-separator {
  height: 1rem;
}

.app-shell [data-slot="breadcrumb-link"],
.app-shell [data-sidebar="sidebar"] a,
[data-sidebar="sidebar"] a {
  color: inherit !important;
  text-decoration: none;
}

@media (max-width: 639px) {
  .app-shell .breadcrumb-parent {
    display: none;
  }
}

/* Keep the template responsive utilities above legacy global utility styles. */
@media (min-width: 769px) {
  .app-shell [data-slot="sidebar"].peer {
    display: block;
  }

  .app-shell [data-slot="sidebar"].peer > .fixed {
    display: flex;
  }
}
</style>
