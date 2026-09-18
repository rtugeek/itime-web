<script setup lang="ts">
import { computed, reactive, ref, toRaw, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import consola from 'consola'
import dayjs from 'dayjs'
import { Calendar, Flag, Loader2, Save, Trash2, X } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import { useTodoStore } from '@/stores/useTodoStore'
import { TodoUtils } from '@/utils/TodoUtils'
import DatePicker from '@/components/DatePicker.vue'
import RecurrenceFormItem from '@/components/form/RecurrenceFormItem.vue'
import ReminderTimeFormItem from '@/components/form/ReminderTimeFormItem.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const todoStore = useTodoStore()
const showDeleteDialog = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const id = String(route.query.id ?? '')
const todo = reactive(TodoUtils.new())

if (id) {
  todoStore.find(id).then((res) => {
    if (res) {
      Object.assign(todo, res)
    }
  })
}
else {
  if (route.query.dueDateTime) {
    todo.dueDateTime = dayjs(route.query.dueDateTime as string).toISOString()
  }
}

watch(() => todo.recurrence, (val) => {
  consola.info(val)
})

const dueDateTime = computed<Date | undefined>({
  get: () => todo.dueDateTime ? new Date(todo.dueDateTime) : undefined,
  set: (val: Date | undefined) => {
    todo.dueDateTime = val ? val.toISOString() : undefined
  },
})

watch(() => todo.recurrence, () => {
  if (!todo.dueDateTime) {
    todo.dueDateTime = new Date().toISOString()
  }
})

async function save() {
  if (isSaving.value) { return }
  isSaving.value = true
  const loadingId = toast.loading(t('todo.saving'))
  try {
    await todoStore.saveTodo(toRaw(todo))
    router.push({ name: 'Todo' })
    toast.success(t('todo.saveSuccess'), { id: loadingId })
  }
  catch (e) {
    consola.error(e)
    toast.error(t('todo.saveFailed'), { id: loadingId })
  }
  finally {
    isSaving.value = false
  }
}

function confirmDelete() {
  showDeleteDialog.value = true
}

async function handleDeleteConfirm() {
  if (isDeleting.value) { return }
  isDeleting.value = true
  try {
    await todoStore.deleteTodo(todo)
    router.push({ name: 'Todo' })
    toast.success(t('todo.deleteSuccess'))
  }
  catch (e) {
    consola.error(e)
    toast.error(t('todo.deleteFailed'))
  }
  finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <section class="todo-editor">
    <form class="editor-card" @submit.prevent="save">
      <div class="editor-section">
        <div class="editor-field">
          <div class="field-label">
            <label for="todo-title" class="flex items-center gap-2">
              <Flag class="size-4 text-muted-foreground" />
              {{ t('todo.content') }} <span class="required-mark" aria-hidden="true">*</span>
            </label>
          </div>
          <Input id="todo-title" v-model="todo.title" :placeholder="t('todo.content')" required />
        </div>
        <div class="editor-field">
          <div class="field-label">
            <label for="todo-due-date" class="flex items-center gap-2">
              <Calendar class="size-4 text-muted-foreground" />
              {{ t('todo.dueDateTime') }}
            </label>
          </div>
          <div class="flex min-w-0 items-center gap-2">
            <DatePicker id="todo-due-date" v-model="dueDateTime" class="flex-1" :placeholder="t('todo.dueDateTime')" />
            <Button v-if="todo.dueDateTime" type="button" variant="ghost" size="icon" :aria-label="t('todo.clearDate')" @click="todo.dueDateTime = undefined">
              <X class="size-4" />
            </Button>
          </div>
        </div>
        <RecurrenceFormItem v-model="todo.recurrence" />
        <ReminderTimeFormItem v-model:enable="todo.isReminderOn" v-model="todo.reminderDateTime" />
      </div>

      <footer class="editor-footer">
        <Button v-if="id" class="delete-button" type="button" variant="destructive" aria-label="删除待办" :disabled="isSaving" @click="confirmDelete">
          <Trash2 class="size-4" />
          {{ t('todo.delete') }}
        </Button>
        <Button type="button" variant="outline" @click="router.push({ name: 'Todo' })">
          {{ t('cancel') }}
        </Button>
        <Button type="submit" :disabled="isSaving">
          <Loader2 v-if="isSaving" class="size-4 animate-spin" />
          <Save v-else class="size-4" />
          {{ t('todo.save') }}
        </Button>
      </footer>
    </form>
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t('todo.confirm') }}</AlertDialogTitle>
          <AlertDialogDescription>{{ todo.title }}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{{ t('cancel') }}</AlertDialogCancel>
          <AlertDialogAction :disabled="isDeleting" @click="handleDeleteConfirm">
            <Loader2 v-if="isDeleting" class="size-4 animate-spin" />
            {{ t('todo.confirm') }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>
</template>

<style scoped>
.todo-editor {
  width: 100%;
  max-width: 640px;
  margin-inline: auto;
  padding-block: 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field-label,
.editor-footer {
  display: flex;
  align-items: center;
}

.field-label {
  justify-content: space-between;
  gap: 16px;
}

.field-hint {
  color: var(--muted-foreground);
  font-size: 12px;
  line-height: 1.6;
}

.editor-card {
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--card);
  color: var(--card-foreground);
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 28px;
}

.editor-field { display: grid; min-width: 0; gap: 10px; }
.field-label { font-size: 13px; font-weight: 500; }
.field-hint { font-weight: 400; }
.required-mark { color: var(--destructive); }
.editor-input { width: 100%; }
.editor-footer {
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 28px;
  border-top: 1px solid var(--border);
  border-radius: 0 0 16px 16px;
  background: var(--muted);
}

.editor-footer :deep(.delete-button) { margin-right: auto; flex: none; }

@media (max-width: 639px) {
  .todo-editor { padding-block: 8px 16px; gap: 20px; }
  .editor-section { padding: 20px 16px; }
  .editor-footer { padding: 10px 16px; }
}
</style>
