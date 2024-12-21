import { createRouter, createWebHashHistory } from 'vue-router'
import WidgetRouter from '../widgets/widget-router'
import SignIn from '@/views/user/SignIn.vue'
import SignUp from '@/views/user/SignUp.vue'
import HomeLayout from '@/components/layout/HomeLayout.vue'
import BaseLayout from '@/components/layout/BaseLayout.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    ...WidgetRouter,
    {
      path: '/',
      meta: {
        title: 'iTime',
      },
      component: HomeLayout,
      children: [
        {
          path: '',
          redirect: '/countdown',
        },
        {
          path: 'countdown',
          component: () => import('@/views/countdown/CountdownList.vue'),
        },
        {
          path: 'pomodoro',
          component: () => import('@/views/pomodoro/PomodoroView.vue'),
        },
        {
          name: 'Settings',
          path: 'settings',
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
      path: '/todo/add',
      name: 'AddTodoView',
      component: () => import('../views/todo/AddTodoView.vue'),
    },
    {
      path: '/birthday/add',
      name: 'AddBirthday',
      component: () => import('../views/birthday/AddBirthdayView.vue'),
    },
    {
      path: '/countdown',
      name: 'Countdown',
      children: [
        {
          path: 'add',
          name: 'CountdownAdd',
          component: () => import('../views/countdown/AddCountdownView.vue'),
        },
        {
          path: 'format',
          name: 'CountdownFormat',
          component: () => import('../views/countdown/format/CountdownFormatView.vue'),
        },
      ],
    },
    {
      path: '/pomodoro/scene',
      name: 'PomodoroScene',
      children: [
        {
          path: 'add',
          name: 'AddPomodoroSceneView',
          component: () => import('../views/pomodoro/AddPomodoroSceneView.vue'),
        },
        {
          path: 'detail',
          name: 'PomodoroDetail',
          component: () => import('../views/pomodoro/PomodoroDetailView.vue'),
        },
      ],
    },
    {
      path: '/pomodoro/history',
      children: [
        {
          path: '',
          name: 'PomodoroHistory',
          component: () => import('../views/pomodoro/history/PomodoroHistoryView.vue'),
        },
      ],
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
    {
      path: '/widget/gallery/android',
      name: 'WidgetAndroidGallery',
      component: () => import('../widgets/AndroidWidgetGallery.vue'),
    },
  ],
})

export default router
