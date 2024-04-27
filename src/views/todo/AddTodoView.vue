<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { Todo } from '@/data/Todo'
import BaseView from '@/components/BaseView.vue'

const route = useRoute()
const showDatePicker = ref(false)

const id = route.query.id
const title = ref('代办事项')
const todo = ref(new Todo(''))
if (id) {
  title.value = '编辑代办事项'
  todo.value = new Todo('')
}

const now = ref(new Date())
const reminderDateTime = computed({
  get: () => todo.value.reminderDateTime ? dayjs(todo.value.reminderDateTime).toDate() : new Date(),
  set: (val: Date) => {
    todo.value.reminderDateTime = val.toISOString()
  },
})
const max = new Date(2035, 10, 1)
const alertTimeTxt = computed(() => {
  if (reminderDateTime.value) {
    return dayjs(reminderDateTime.value).format('YYYY年MM月DD日 HH时mm分')
  }
  return ''
})

function formatter(type: string, option: any) {
  switch (type) {
    case 'year':
      option.text += '年'
      break
    case 'month':
      option.text += '月'
      break
    case 'day':
      option.text += '日'
      break
    case 'hour':
      option.text += '时'
      break
    case 'minute':
      option.text += '分'
      break
    default:
      option.text += ''
  }
  return option
}
</script>

<template>
  <BaseView :title="title">
    <div class="flex flex-col mt-2 p-4">
      <nut-form>
        <nut-form-item label="代办事项" label-align="center">
          <nut-input v-model="todo.title" placeholder="请输入内容" />
        </nut-form-item>
        <nut-form-item label="提醒时间" label-align="center" @click="showDatePicker = true">
          <nut-input v-model="alertTimeTxt" readonly class="w-full cursor-pointer" placeholder="可选项" @click="showDatePicker = true" />
        </nut-form-item>
        <nut-popup v-model:visible="showDatePicker" position="bottom">
          <nut-date-picker
            v-model="reminderDateTime"
            :min-date="now"
            type="datetime"
            :max-date="max"
            :formatter="formatter"
            :three-dimensional="false"
            @confirm="showDatePicker = false"
            @cancel="showDatePicker = false"
          />
        </nut-popup>
      </nut-form>

      <nut-button class="mt-4" block type="primary">
        保存
      </nut-button>
    </div>
  </BaseView>
</template>
