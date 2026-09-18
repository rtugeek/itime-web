<script setup lang="ts">
import dayjs from 'dayjs'
import { useRoute, useRouter } from 'vue-router'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, Delete } from '@lucide/vue'
import { toast } from 'vue-sonner'
import type { PomodoroHistory } from '@/data/PomodoroHistory'
import { usePomodoroStore } from '@/stores/usePomodoroStore'
import { Button } from '@/components/ui/button'
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

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const id = route.query.id as string
const histories = ref<PomodoroHistory[]>()
const pomodoroStore = usePomodoroStore()
watch(() => pomodoroStore.dataRevision, async () => {
  if (id) { histories.value = await pomodoroStore.findHistoryBySceneId(id) }
}, { immediate: true })

const showDeleteDialog = ref(false)
const pendingDeleteHistory = ref<PomodoroHistory | null>(null)

function deleteHistory(history: PomodoroHistory) {
  pendingDeleteHistory.value = history
  showDeleteDialog.value = true
}

async function handleDeleteConfirm() {
  if (!pendingDeleteHistory.value) { return }
  const loadingId = toast.loading(t('deleting'))
  try {
    await pomodoroStore.deleteHistory(pendingDeleteHistory.value)
    histories.value = histories.value?.filter(item => item.id !== pendingDeleteHistory.value!.id)
  }
  finally {
    toast.dismiss(loadingId)
  }
  showDeleteDialog.value = false
  pendingDeleteHistory.value = null
}

function handleDeleteCancel() {
  showDeleteDialog.value = false
  pendingDeleteHistory.value = null
}

function onBack() {
  if (id) {
    router.push({ name: 'PomodoroDetail', query: { id: String(id) } })
  }
  else {
    router.push({ name: 'Pomodoro' })
  }
}
</script>

<template>
  <main class="min-w-0 flex-1 p-3 sm:p-4">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div class="space-y-2">
          <h1 class="text-2xl font-semibold tracking-tight !text-foreground sm:text-3xl">
            {{ t('pomodoro.history.title') }}
          </h1>
        </div>
        <Button variant="outline" @click="onBack">
          <ArrowLeft class="size-4" />
          返回
        </Button>
      </header>

      <section aria-labelledby="pomodoro-history-title" class="space-y-4">
        <div class="flex flex-col">
          <div
            v-for="history in histories"
            :key="history.id"
            class="flex items-center p-3 mb-2 rounded-lg border bg-card"
          >
            <div class="flex gap-1 items-center w-full">
              <div class="text-lg">
                {{ Math.ceil(history.duration / 60) }} {{ t('minute') }}
              </div>
              <div class="text-sm ml-auto">
                {{ dayjs(history.startTime).format('YYYY-MM-DD HH:mm') }}
              </div>
              <Button size="icon" variant="ghost" class="ml-4" @click="deleteHistory(history)">
                <Delete class="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t('pomodoro.history.deleteTip') }}</AlertDialogTitle>
          <AlertDialogDescription />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="handleDeleteCancel">
            {{ t('cancel') }}
          </AlertDialogCancel>
          <AlertDialogAction @click="handleDeleteConfirm">
            {{ t('confirm') }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </main>
</template>
