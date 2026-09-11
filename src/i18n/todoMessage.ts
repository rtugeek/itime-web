import type { DefaultLocaleMessageSchema } from 'vue-i18n'

export const todoMessage: DefaultLocaleMessageSchema = {
  zh: {
    todo: {
      title: '待办事项',
      history: '历史记录',
      edit: '编辑事项',
      content: '待办内容',
      dueDateTime: '目标日期',
      clearDate: '清除目标日期',
      reminder: '提醒',
      reminderDateTime: '选择提醒时间',
      saving: '保存中...',
      delete: '删除',
      confirm: '确定',
      save: '保存',
      saveSuccess: '保存成功',
      saveFailed: '保存失败',
      deleteSuccess: '删除成功',
      deleteFailed: '删除失败',
    },
  },
  en: {
    todo: {
      title: 'To-Do',
      history: 'History',
      edit: 'Edit To-Do',
      content: 'Content',
      dueDateTime: 'Due Date',
      clearDate: 'Clear due date',
      reminder: 'Reminder',
      reminderDateTime: 'Choose reminder time',
      saving: 'Saving...',
      delete: 'Delete',
      confirm: 'Confirm',
      save: 'Save',
      saveSuccess: 'Saved successfully',
      saveFailed: 'Failed to save',
      deleteSuccess: 'Deleted successfully',
      deleteFailed: 'Failed to delete',
    },
  },
}
