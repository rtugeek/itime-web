import { createRouter, createWebHashHistory } from 'vue-router'
import WidgetRouter from '../widgets/widget-router'
import HomeView from '../views/HomeView.vue'
import SignIn from '@/views/user/SignIn.vue'
import SignUp from '@/views/user/SignUp.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    ...WidgetRouter,
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/user',
      name: 'User',
      children:[
        {
          path:'sign/in',
          name:'UserSignIn',
          component: SignIn
        },
        {
          path:'sign/up',
          name:'UserSignUp',
          component: SignUp
        }
      ]
    },
    {
      path: '/todo/add',
      name: 'AddTodoView',
      component: () => import('../views/todo/AddTodoView.vue'),
    },
    {
      path: '/pomodoro/add',
      name: 'AddPomodoroSceneView',
      component: () => import('../views/pomodoro/AddPomodoroSceneView.vue'),
    },
    {
      path: '/widget/todo/list',
      name: 'WidgetTodoList',
      component: () => import('../views/todo/AddTodoView.vue'),
    },
  ],
})

export default router
