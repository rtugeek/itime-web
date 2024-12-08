import type { DefaultLocaleMessageSchema } from 'vue-i18n'

export const todoMessage: DefaultLocaleMessageSchema = {
  zh: {
    todo: {
      title: '待办事项',
      history: '历史记录',
      edit: '编辑事项',
      content: '待办内容',
      dueDateTime: '目标日期',
    },
  },
  en: {
    todo: {
      title: 'To-Do',
      history: 'History',
      edit: 'Edit To-Do',
      content: 'Content',
      dueDateTime: 'Due Date',
    },
  },
}
