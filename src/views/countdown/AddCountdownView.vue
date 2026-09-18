<script lang="ts" setup>
import { computed, reactive, ref, toRaw } from 'vue'
import 'vue3-emoji-picker/css'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Save, Trash2 } from '@lucide/vue'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import { useCountdownEventStore } from '@/stores/useCountdownEventStore'
import { CountdownEvent } from '@/data/CountdownEvent'
import { CountdownEventRepository } from '@/data/repository/CountdownEventRepository'
import DateInput from '@/components/DateInput.vue'
import RecurrenceFormItem from '@/components/form/RecurrenceFormItem.vue'
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

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const id = route.query.id as string
const showDeleteDialog = ref(false)

const countdownEventStore = useCountdownEventStore()

const event = reactive<CountdownEvent>(new CountdownEvent('', new Date()))

if (id) {
  CountdownEventRepository.get(id).then((res) => {
    if (res) {
      Object.assign(event, res)
    }
  })
}

async function save() {
  if (!event.name.trim()) {
    toast.warning(t('countdown.nameEmptyWarning'))
    return
  }
  await countdownEventStore.save(toRaw(event))
  router.push({ name: 'Countdown' })
}

function deleteCountdown() {
  showDeleteDialog.value = true
}

async function handleDeleteConfirm() {
  await countdownEventStore.deleteCountdown(String(event.id))
  router.push({ name: 'Countdown' })
}

const dateTimeModel = computed<Date>({
  get: () => dayjs(event.sourceDateTime).toDate(),
  set: (val: Date) => {
    event.setSourceDateTime(val)
  },
})
</script>

<template>
  <section class="countdown-editor">
    <form class="editor-card" @submit.prevent="save">
      <div class="editor-section">
        <div class="editor-field">
          <div class="field-label">
            <label for="countdown-name">倒计时名称 <span class="required-mark" aria-hidden="true">*</span></label>
            <span class="field-hint tabular-nums">{{ event.name.length }}/15</span>
          </div>
          <Input id="countdown-name" v-model="event.name" aria-required="true" :placeholder="t('countdown.namePlaceholder')" :maxlength="15" class="editor-input" required />
        </div>
        <div class="editor-field">
          <div class="field-label">
            <label for="countdown-note">{{ t('countdown.note') }}</label>
            <span class="field-hint">选填</span>
          </div>
          <Input id="countdown-note" v-model="event.note" placeholder="添加备注" class="editor-input" />
        </div>
        <div class="editor-field" role="group" aria-labelledby="countdown-date-label">
          <span id="countdown-date-label" class="field-label">目标日期</span>
          <DateInput v-model="dateTimeModel" v-model:date-type="event.dateType" />
        </div>
        <RecurrenceFormItem v-show="event.dateType === 0" v-model="event.recurrence" />
      </div>

      <footer class="editor-footer">
        <Button v-if="id" class="delete-button" type="button" variant="destructive" aria-label="删除倒计时" @click="deleteCountdown">
          <Trash2 class="size-4" aria-hidden="true" />
          删除
        </Button>
        <Button type="button" variant="outline" @click="router.push({ name: 'Countdown' })">
          {{ t('cancel') }}
        </Button>
        <Button type="submit">
          <Save class="size-4" aria-hidden="true" />
          {{ t('save') }}
        </Button>
      </footer>
    </form>
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除倒计时？</AlertDialogTitle>
          <AlertDialogDescription>{{ t('countdown.deleteConfirm', { name: event.name }) }}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{{ t('cancel') }}</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-white hover:bg-destructive/90" @click="handleDeleteConfirm">
            确认删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>
</template>

<style scoped>
.countdown-editor {
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
  .countdown-editor { padding-block: 8px 16px; gap: 20px; }
  .editor-section { padding: 20px 16px; }
  .editor-footer { padding: 10px 16px; }
}
</style>
