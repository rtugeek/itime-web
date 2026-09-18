import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import { toast } from 'vue-sonner'
import { UserDataSync } from '@/data/sync/UserDataSync'
import { PomodoroHistorySync } from '@/data/sync/PomodoroHistorySync'

export const useSyncStore = defineStore('sync-store', () => {
  const syncing = computed(() => UserDataSync.busy.value || PomodoroHistorySync.busy.value)

  let lastUserDataError = ''
  let lastHistoryError = ''

  watch(
    () => UserDataSync.error.value,
    (error) => {
      if (error && error !== lastUserDataError) {
        lastUserDataError = error
        toast.error(error)
      }
      if (!error) {
        lastUserDataError = ''
      }
    },
    { immediate: true },
  )

  watch(
    () => PomodoroHistorySync.error.value,
    (error) => {
      if (error && error !== lastHistoryError) {
        lastHistoryError = error
        toast.error(error)
      }
      if (!error) {
        lastHistoryError = ''
      }
    },
    { immediate: true },
  )

  function sync() {
    void PomodoroHistorySync.sync()
  }

  return {
    syncing,
    sync,
  }
})
