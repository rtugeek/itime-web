<script lang="ts" setup>
import { computed, reactive, ref, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Calendar, Loader2, Save, Trash2, User } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import { useBirthdayStore } from '@/stores/useBirthdayStore'
import { BirthdayUtils } from '@/utils/BirthdayUtils'
import { BirthdayWrapper } from '@/data/BirthdayWrapper'
import DateInput from '@/components/DateInput.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
const id = Number.parseInt((route.query.id ?? '0') as string)
const showDeleteDialog = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)

const birthdayStore = useBirthdayStore()
const birthday = reactive(BirthdayUtils.new())
const birthdayWrapper = reactive(new BirthdayWrapper(birthday))

if (id > 0) {
  birthdayStore.find(id.toString()).then((res) => {
    if (res) {
      Object.assign(birthday, res)
      Object.assign(birthdayWrapper, new BirthdayWrapper(birthday))
    }
  })
}

const sourceSolarDate = computed<Date>({
  get: () => birthdayWrapper.getSourceSolarDate(),
  set: (val: Date) => {
    birthdayWrapper.setDate(val)
  },
})

const dateTypeModel = computed({
  get: () => birthday.dateType,
  set: (val) => {
    birthday.dateType = val
    birthdayWrapper.setDateType(val)
  },
})

async function save() {
  if (isSaving.value || isDeleting.value) { return }
  if (!birthday.name.trim()) {
    toast.error(t('birthday.placeholder.contact'))
    return
  }
  isSaving.value = true
  const loadingId = toast.loading(t('saving'))
  try {
    await birthdayStore.save(toRaw(birthday))
    toast.success(t('saving'), { id: loadingId })
    router.push({ name: 'Birthday' })
  }
  catch (e) {
    toast.error(t('saving'), { id: loadingId })
  }
  finally {
    isSaving.value = false
  }
}

function deleteBirthday() {
  showDeleteDialog.value = true
}

async function handleDeleteConfirm() {
  if (isDeleting.value || isSaving.value) { return }
  isDeleting.value = true
  try {
    await birthdayStore.removeById(String(birthday.id))
    toast.success(t('delete'))
    router.push({ name: 'Birthday' })
  }
  catch (e) {
    toast.error(t('delete'))
  }
  finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <section class="birthday-editor">
    <form class="editor-card" @submit.prevent="save">
      <div class="editor-section">
        <div class="editor-field">
          <div class="field-label">
            <Label for="birthday-name" class="flex items-center gap-2">
              <User class="size-4 text-muted-foreground" aria-hidden="true" />
              {{ t('birthday.placeholder.contact') }} <span class="required-mark" aria-hidden="true">*</span>
            </Label>
          </div>
          <Input id="birthday-name" v-model="birthday.name" :placeholder="t('birthday.placeholder.contact')" required />
        </div>
        <div class="editor-field" role="group" aria-labelledby="birthday-date-label">
          <div class="field-label">
            <Label id="birthday-date-label" as="span" class="flex items-center gap-2">
              <Calendar class="size-4 text-muted-foreground" aria-hidden="true" />
              出生日期
            </Label>
          </div>
          <DateInput v-model="sourceSolarDate" v-model:date-type="dateTypeModel" />
        </div>
      </div>

      <footer class="editor-footer">
        <Button v-if="id > 0" class="delete-button" type="button" variant="destructive" aria-label="删除生日" :disabled="isSaving || isDeleting" @click="deleteBirthday">
          <Trash2 class="size-4" aria-hidden="true" />
          删除
        </Button>
        <Button type="button" variant="outline" @click="router.push({ name: 'Birthday' })">
          {{ t('cancel') }}
        </Button>
        <Button type="submit" :disabled="isSaving || isDeleting">
          <Loader2 v-if="isSaving" class="size-4 animate-spin" aria-hidden="true" />
          <Save v-else class="size-4" aria-hidden="true" />
          {{ t('save') }}
        </Button>
      </footer>
    </form>
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除生日？</AlertDialogTitle>
          <AlertDialogDescription>{{ birthday.name }}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{{ t('cancel') }}</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-white hover:bg-destructive/90" :disabled="isDeleting" @click="handleDeleteConfirm">
            <Loader2 v-if="isDeleting" class="size-4 animate-spin" aria-hidden="true" />
            确认删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>
</template>

<style scoped>
.birthday-editor {
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
.required-mark { color: var(--destructive); }
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
  .birthday-editor { padding-block: 8px 16px; gap: 20px; }
  .editor-section { padding: 20px 16px; }
  .editor-footer { padding: 10px 16px; }
}
</style>
