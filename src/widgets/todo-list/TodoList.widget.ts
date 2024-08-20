import {
  Widget,
  WidgetKeyword,
} from '@widget-js/core'

const TodoListWidget = new Widget({
  name: 'itime.fun.todo_list',
  title: { 'zh-CN': '待办事项（Pro）' },
  description: { 'zh-CN': '带数据同步功能的待办事项' },
  keywords: [WidgetKeyword.RECOMMEND],
  lang: 'zh-CN',
  categories: ['productivity', 'utilities'],
  previewImage: '/images/preview_todo_list.png',
  width: 4,
  height: 4,
  minWidth: 3,
  maxWidth: 6,
  minHeight: 3,
  maxHeight: 6,
  path: '/widget/todo_list',
  configPagePath: '/settings?frame=true&transparent=false&width=400&height=700',
})

export default TodoListWidget
