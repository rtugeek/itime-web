import type { DefaultLocaleMessageSchema } from 'vue-i18n'

export const birthdayMessage: DefaultLocaleMessageSchema = {
  zh: {
    birthday: {
      list: '事件列表',
      add: '添加事件',
      edit: '编辑事件',
      placeholder: {
        contact: '事件名称',
        introduction: '事件简介',
      },
    },
  },
  en: {
    birthday: {
      list: 'Event List',
      add: 'Add Event',
      edit: 'Edit Event',
      placeholder: {
        contact: 'Please enter event name',
        introduction: 'Please enter event introduction',
      },
    },
  },
}
