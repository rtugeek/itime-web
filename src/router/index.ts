import { createRouter, createWebHashHistory } from 'vue-router'
import WidgetRouter from '../widgets/widget-router'
import SignIn from '@/views/user/SignIn.vue'
import SignUp from '@/views/user/SignUp.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import BaseLayout from '@/components/layout/BaseLayout.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    ...WidgetRouter,
    {
      path: '/',
      meta: {
        title: '时间管理',
      },
      component: AppSidebar,
      children: [
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
          name: 'Settings',
          path: 'settings',
          meta: { title: '设置' },
          children: [],
          component: () => import('@/views/settings/Settings.vue'),
        },
      ],
    },
    {
      path: '/user',
      name: 'User',
      component: BaseLayout,
      children: [
        {
          path: 'sign/in',
          meta: {
            title: '登录',
          },
          name: 'UserSignIn',
          component: SignIn,
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
          component: SignUp,
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

export default router
