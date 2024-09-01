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
      ],
    },
    {
      path: '/pomodoro',
      name: 'Pomodoro',
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
      path: '/widget/todo/list',
      name: 'WidgetTodoList',
      component: () => import('../views/todo/AddTodoView.vue'),
    },
  ],
})

export default router
