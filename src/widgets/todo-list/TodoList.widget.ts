import { DeployMode, Widget, WidgetKeyword } from '@widget-js/core'

const TodoListWidget = new Widget({
  name: '.todo_list',
  title: { 'zh-CN': '待办事项（Pro）', 'en-US': 'To-Do' },
  description: { 'zh-CN': '带数据同步功能的待办事项', 'en-US': 'To-Do list with data synchronization' },
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
  supportDeployMode: DeployMode.TRAY | DeployMode.OVERLAP | DeployMode.NORMAL,
  path: '/widget/todo_list',
  browserWindowOptions: {
    backgroundThrottling: false,
  },
  configPagePath: '/widget/todo_list/config?frame=true&transparent=false&width=600&height=500',
})

export default TodoListWidget
