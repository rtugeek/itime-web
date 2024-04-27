import type { RouteRecordRaw } from 'vue-router'
import TodoListWidget from './TodoList.widget'

const path = TodoListWidget.path
const name = TodoListWidget.name

const configPagePath = TodoListWidget.configPagePath!

const TodoListWidgetRoutes: RouteRecordRaw[] = [
  {
    path,
    name: `${name}`,
    component: () =>
      import(
        /* webpackChunkName: "com.wisdom.itime.todo_list" */ './TodoListWidgetView.vue'
      ),
  },
  {
    path: configPagePath,
    name: `${name}.config`,
    component: () =>
      import(
        /* webpackChunkName: "com.wisdom.itime.todo_list.config" */ './TodoListConfigView.vue'
      ),
  },
]

export default TodoListWidgetRoutes
