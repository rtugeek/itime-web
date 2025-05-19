<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Calendar, CloseOne, Flag } from '@icon-park/vue-next'
import consola from 'consola'
import { showDialog, showToast } from '@nutui/nutui'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import BaseView from '@/components/BaseView.vue'
import { useTodoStore } from '@/stores/useTodoStore'
import { TodoUtils } from '@/utils/TodoUtils'
import DateTimePicker from '@/components/DateTimePicker.vue'
import RecurrenceFormItem from '@/components/form/RecurrenceFormItem.vue'
import ReminderTimeFormItem from '@/components/form/ReminderTimeFormItem.vue'
import { AppUtils } from '@/utils/AppUtils'

const { t } = useI18n()
const todoStore = useTodoStore()
const route = useRoute()
const showDatePicker = ref(false)
const id = Number.parseInt((route.query.id ?? '0') as string)
const title = ref(t('todo.title'))
const todo = ref(TodoUtils.new())
const router = useRouter()
const isEdit = ref(false)
if (id > 0) {
  title.value = t('todo.edit')
  todoStore.find(id.toString()).then((res) => {
    if (res) {
      todo.value = reactive(res)
    }
  })
  isEdit.value = true
}
else {
  if (route.query.dueDateTime) {
    todo.value.dueDateTime = dayjs(route.query.dueDateTime as string).toISOString()
  }
}

watch(() => todo.value.recurrence, (val) => {
  consola.info(val)
})

const dueDateTimeText = computed(() => {
  if (todo.value.dueDateTime) {
    return dayjs(todo.value.dueDateTime).format('YYYY年MM月DD日')
  }
  return ''
})

const dueDateTime = computed<string | undefined>({
  get: () => {
    return todo.value.dueDateTime
  },
  set: (val: Date | undefined) => {
    todo.value.dueDateTime = val ? val.toISOString() : undefined
  },
})

watch(() => todo.value.recurrence, () => {
  if (!todo.value.dueDateTime) {
    todo.value.dueDateTime = new Date().toISOString()
  }
})

async function save() {
  showToast.loading(t('saving'), { id: 'loading' })
  try {
    await todoStore.saveTodo(todo.value)
  }
  catch (e) {
    consola.error(e)
  }
  showToast.hide('loading')
  window.close()
}

async function deleteTodo() {
  showDialog({
    title: t('todo.deleteConfirm'),
    content: todo.value.title,
    okText: t('confirm'),
    onOk: async () => {
      await todoStore.deleteTodo(todo.value)
      AppUtils.back(router, true)
    },
  })
}
</script>

<template>
  <BaseView :title="title">
    <div class="flex flex-col mt-2 p-4">
      <nut-form>
        <nut-form-item :label-width="30" label-align="center">
          <template #label>
            <Flag />
          </template>
          <nut-input v-model="todo.title" :placeholder="t('todo.content')" />
        </nut-form-item>
        <nut-form-item :label-width="30" label-align="center" @click="showDatePicker = true">
          <template #label>
            <Calendar />
          </template>
          <nut-input
            v-model="dueDateTimeText" readonly class="w-full cursor-pointer" :placeholder="t('todo.dueDateTime')"
            @click="showDatePicker = true"
          >
            <template #right>
              <div
                class="w-6 h-6 flex items-center cursor-pointer text-center"
                @click.stop="todo.dueDateTime = undefined"
              >
                <CloseOne v-if="todo.dueDateTime" />
              </div>
            </template>
          </nut-input>
        </nut-form-item>
        <RecurrenceFormItem v-model="todo.recurrence" />
        <!--        <nut-form-item v-show="todo.dueDateTime" :label-width="30" label-align="center"> -->
        <!--          <template #label> -->
        <!--            <div class="flex items-center justify-center content-center h-full"> -->
        <!--              <AlarmClock :size="14" /> -->
        <!--            </div> -->
        <!--          </template> -->
        <ReminderTimeFormItem v-model:enable="todo.isReminderOn" v-model="todo.reminderDateTime" />
      </nut-form>
      <DateTimePicker v-model="showDatePicker" v-model:date-time="dueDateTime" />
      <nut-button class="mt-4" block type="primary" @click="save">
        {{ t('save') }}
      </nut-button>
      <nut-button v-if="isEdit" class="mt-2" type="danger" @click="deleteTodo">
        {{ t('delete') }}
      </nut-button>
    </div>
  </BaseView>
</template>
