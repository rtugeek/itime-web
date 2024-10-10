<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Calendar, CloseOne, Flag, PlayCycle } from '@icon-park/vue-next'
import consola from 'consola'
import { showToast } from '@nutui/nutui'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import BaseView from '@/components/BaseView.vue'
import { RRuleUtils } from '@/utils/RRuleUtils'
import NutRecurrentPicker from '@/components/NutRecurrentPicker.vue'
import { useTodoStore } from '@/stores/useTodoStore'
import { TodoUtils } from '@/utils/TodoUtils'

const { t } = useI18n()
const todoStore = useTodoStore()
const route = useRoute()
const showDatePicker = ref(false)
// const showReminderDatePicker = ref(false)
const showRRulePicker = ref(false)
const id = Number.parseInt((route.query.id ?? '0') as string)
const title = ref(t('todo.title'))
const todo = ref(TodoUtils.new())

if (id > 0) {
  title.value = t('todo.edit')
  todoStore.find(id.toString()).then((res) => {
    if (res) {
      todo.value = reactive(res)
    }
  })
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
//
// const reminderDateTimeText = computed(() => {
//   if (todo.value.reminderDateTime) {
//     return dayjs(todo.value.reminderDateTime).format('YYYY年MM月DD日 HH时mm分')
//   }
//   return ''
// })

const rruleTxt = computed(() => RRuleUtils.toString(todo.value.recurrence))

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
  showToast.loading('保存中', { id: 'loading' })
  try {
    await todoStore.saveTodo(todo.value)
  }
  catch (e) {
    consola.error(e)
  }
  showToast.hide('loading')
  window.close()
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
            <div class="flex items-center justify-center content-center h-full">
              <Calendar />
            </div>
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
        <nut-form-item :label-width="30" label-align="center" @click="showRRulePicker = true">
          <template #label>
            <PlayCycle />
          </template>
          <nut-input
            v-model="rruleTxt" readonly class="w-full cursor-pointer" :placeholder="t('recurrence.title')"
            @click="showRRulePicker = true"
          />
        </nut-form-item>
        <!--        <nut-form-item v-show="todo.dueDateTime" :label-width="30" label-align="center"> -->
        <!--          <template #label> -->
        <!--            <div class="flex items-center justify-center content-center h-full"> -->
        <!--              <AlarmClock :size="14" /> -->
        <!--            </div> -->
        <!--          </template> -->
        <!--          <nut-input -->
        <!--            v-model="reminderDateTimeText" readonly class="w-full cursor-pointer" placeholder="提醒" -->
        <!--            @click="showDatePicker = true" -->
        <!--          > -->
        <!--            <template #right> -->
        <!--              <div -->
        <!--                class="w-6 h-6 flex items-center cursor-pointer text-center" -->
        <!--                @click.stop="todo.reminderDateTime = undefined" -->
        <!--              > -->
        <!--                <CloseOne v-if="todo.reminderDateTime" /> -->
        <!--              </div> -->
        <!--            </template> -->
        <!--          </nut-input> -->
        <!--        </nut-form-item> -->
      </nut-form>
      <NutRecurrentPicker v-model="showRRulePicker" v-model:rrule="todo.recurrence" />
      <DateTimePicker v-model="showDatePicker" v-model:date-time="dueDateTime" />
      <!--      <DateTimePicker v-model="showReminderDatePicker" v-model:date-time="todo.reminderDateTime" /> -->
      <nut-button class="mt-4" block type="primary" @click="save">
        {{ t('save') }}
      </nut-button>
    </div>
  </BaseView>
</template>
