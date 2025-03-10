import type { RouteRecordRaw } from 'vue-router'
import TodoListWidget from './TodoList.widget'

const url = TodoListWidget.path
const name = TodoListWidget.name
const configPath = TodoListWidget.configPagePath!.split('?')[0]

const TodoListWidgetRoutes: RouteRecordRaw[] = [
  {
    path: url,
    name: `${name}`,
    component: () => import(/* webpackChunkName: "com.wisdom.widgets.todo_list" */ './TodoListWidgetView.vue'),
  },
  {
    path: configPath,
    name: `${name}.config`,
    component: () => import(/* webpackChunkName: "com.wisdom.widgets.todo_list" */ './TodoListConfigView.vue'),
  },
]

export default TodoListWidgetRoutes
