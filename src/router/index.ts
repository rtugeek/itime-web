import { createRouter, createWebHashHistory } from 'vue-router'
import WidgetRouter from '../widgets/widget-router'
import HomeView from '../views/HomeView.vue'

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
