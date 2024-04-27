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
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/todo/AddTodoView.vue'),
    },
    {
      path: '/widget/todo/list',
      name: 'WidgetTodoList',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/todo/AddTodoView.vue'),
    },
  ],
})

export default router
