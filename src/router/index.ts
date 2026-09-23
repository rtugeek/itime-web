import { createRouter, createWebHashHistory } from 'vue-router'
import WidgetRouter from '../widgets/widget-router'
import TodoListWidget from '@/widgets/todo-list/TodoList.widget'
import DeadlineWidget from '@/widgets/deadline/Deadline.widget'
import CalendarWidget from '@/widgets/calendar/Calendar.widget'
import BirthdayListWidget from '@/widgets/birthday-list/BirthdayList.widget'
import CalendarLargeWidget from '@/widgets/calendar-large/CalendarLarge.widget'
import CountdownListWidget from '@/widgets/countdown-list/CountdownList.widget'
import CountdownWidget from '@/widgets/countdown/Countdown.widget'
import { normalizeWechatCallback } from '@/common/wechatAuth'
import { useUserStore } from '@/stores/useUserStore'

normalizeWechatCallback()

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    ...WidgetRouter,
    {
      path: '/',
      meta: {
        title: '时间管理',
      },
      component: () => import('@/components/AppSidebar.vue'),
      children: [
        {
          path: 'user',
          name: 'User',
          children: [
            { path: 'password/reset', name: 'UserPasswordReset', component: () => import('@/views/user/ResetPassword.vue'), meta: { title: '找回密码' } },
            { path: 'wechat/callback', name: 'UserWechatCallback', component: () => import('@/views/user/WechatCallback.vue'), meta: { title: '微信登录' } },
            {
              path: 'sign/in',
              meta: {
                title: '登录',
              },
              name: 'UserSignIn',
              component: () => import('@/views/user/SignIn.vue'),
            },
            {
              path: 'sign/in/sms',
              meta: {
                title: '登录',
              },
              name: 'SmsSignIn',
              component: () => import('@/views/user/SmsSignIn.vue'),
            },
            {
              meta: {
                title: '注册',
              },
              path: 'sign/up',
              name: 'UserSignUp',
              component: () => import('@/views/user/SignUp.vue'),
            },
          ],
        },
        {
          path: 'user/profile',
          name: 'UserProfile',
          meta: { title: '账户信息', requiresAuth: true },
          component: () => import('@/views/user/Profile.vue'),
        },
        {
          path: '',
          redirect: '/countdown',
        },
        {
          path: 'todo',
          meta: { title: '代办事项' },
          children: [
            {
              path: '',
              name: 'Todo',
              component: () => import('@/views/todo/TodoListView.vue'),
            },
            {
              path: 'add',
              name: 'TodoAdd',
              meta: { title: '新增待办' },
              component: () => import('@/views/todo/AddTodoView.vue'),
            },
            {
              path: TodoListWidget.configPagePath!.split('?')[0],
              name: `${TodoListWidget.name}.config`,
              meta: { title: '组件设置' },
              component: () => import('@/widgets/todo-list/TodoListConfigView.vue'),
            },
            {
              path: 'history',
              name: 'TodoHistory',
              meta: { title: '已完成事项' },
              component: () => import('@/views/todo/HistoryTodoView.vue'),
            },
          ],
        },
        {
          path: 'birthday',
          meta: { title: '生日' },
          children: [
            {
              path: '',
              name: 'Birthday',
              component: () => import('@/views/birthday/BirthdayList.vue'),
            },
            {
              path: 'add',
              name: 'BirthdayAdd',
              meta: { title: '新增生日' },
              component: () => import('@/views/birthday/AddBirthdayView.vue'),
            },
            {
              path: BirthdayListWidget.configPagePath!.split('?')[0],
              name: `${BirthdayListWidget.name}.config`,
              meta: { title: '组件设置' },
              component: () => import('@/widgets/birthday-list/BirthdayListConfigView.vue'),
            },
          ],
        },
        {
          path: 'countdown',
          meta: { title: '倒计时' },
          children: [
            {
              path: '',
              name: 'Countdown',
              component: () => import('@/views/countdown/CountdownList.vue'),
            },
            {
              path: 'add',
              name: 'CountdownAdd',
              meta: { title: '新增倒计时' },
              component: () => import('@/views/countdown/AddCountdownView.vue'),
            },
            {
              path: CountdownListWidget.configPagePath!.split('?')[0],
              name: `${CountdownListWidget.name}.config`,
              meta: { title: '组件设置' },
              component: () => import('@/widgets/countdown-list/CountdownListConfigView.vue'),
            },
            {
              path: CountdownWidget.configPagePath!.split('?')[0],
              name: `${CountdownWidget.name}.config`,
              meta: { title: '组件设置' },
              component: () => import('@/widgets/countdown/CountdownConfigView.vue'),
            },
            {
              path: DeadlineWidget.configPagePath!.split('?')[0],
              name: `${DeadlineWidget.name}.config`,
              meta: { title: '组件设置' },
              component: () => import('@/widgets/deadline/DeadlineConfigView.vue'),
            },
          ],
        },
        {
          path: 'pomodoro',
          meta: { title: '番茄钟' },
          children: [
            {
              path: '',
              name: 'Pomodoro',
              component: () => import('@/views/pomodoro/PomodoroList.vue'),
            },
            {
              path: 'scene/add',
              name: 'PomodoroSceneAdd',
              meta: { title: '新增场景' },
              component: () => import('@/views/pomodoro/AddPomodoroSceneView.vue'),
            },
            {
              path: 'scene/detail',
              name: 'PomodoroDetail',
              meta: { title: '场景详情' },
              component: () => import('@/views/pomodoro/PomodoroDetailView.vue'),
            },
            {
              path: 'history',
              name: 'PomodoroHistory',
              meta: { title: '番茄钟历史' },
              component: () => import('@/views/pomodoro/history/PomodoroHistoryView.vue'),
            },
          ],
        },
        {
          path: 'calendar',
          meta: { title: '日历' },
          children: [
            {
              path: CalendarWidget.configPagePath!.split('?')[0],
              name: `${CalendarWidget.name}.config`,
              meta: { title: '组件设置' },
              component: () => import('@/widgets/calendar/CalendarConfigView.vue'),
            },
            {
              path: CalendarLargeWidget.configPagePath!.split('?')[0],
              name: `${CalendarLargeWidget.name}.config`,
              meta: { title: '组件设置' },
              component: () => import('@/widgets/calendar-large/CalendarLargeConfigView.vue'),
            },
          ],
        },
        {
          name: 'Settings',
          path: 'settings',
          meta: { title: '设置' },
          children: [],
          component: () => import('@/views/settings/Settings.vue'),
        },
      ],
    },
    {
      path: '/countdown/format',
      name: 'CountdownFormat',
      component: () => import('../views/countdown/format/CountdownFormatView.vue'),
    },
    {
      path: '/settings/debug',
      name: 'DebugInfo',
      component: () => import('../views/settings/DebugInfoView.vue'),
    },
    {
      path: '/settings/ics',
      name: 'Ics',
      component: () => import('../views/settings/IcsCalenderView.vue'),
    },
    {
      path: '/widget/todo/list',
      name: 'WidgetTodoList',
      component: () => import('../views/todo/AddTodoView.vue'),
    },
    {
      path: '/widget/gallery',
      name: 'WidgetGallery',
      component: () => import('../widgets/WebWidgetGallery.vue'),
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !useUserStore().isLogin) {
    return { path: '/user/sign/in', query: { redirect: to.fullPath } }
  }
})

export default router
