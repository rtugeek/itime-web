import type { RouteRecordRaw } from 'vue-router'
import TodoListWidget from './TodoList.widget'

const url = TodoListWidget.path
const name = TodoListWidget.name

const TodoListWidgetRoutes: RouteRecordRaw[] = [
  {
    path: url,
    name: `${name}`,
    component: () => import(/* webpackChunkName: "com.wisdom.widgets.todo_list" */ './TodoListWidgetView.vue'),
  },
]

export default TodoListWidgetRoutes
