import { Widget, WidgetKeyword } from '@widget-js/core'

const TodoListWidget = new Widget({
  name: 'com.wisdom.itime.todo_list',
  title: { 'zh-CN': '代办事项' },
  description: { 'zh-CN': '' },
  keywords: [WidgetKeyword.RECOMMEND],
  lang: 'zh-CN',
  width: 4,
  height: 6,
  minWidth: 4,
  maxWidth: 4,
  minHeight: 4,
  maxHeight: 6,
  previewImage: '修改为组件预览图地址',
  path: '/widget/todo_list',
  configPagePath: '/widget/config/todo_list',
})

export default TodoListWidget
