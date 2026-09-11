import { computed, ref } from 'vue'

const activeSyncs = ref(0)
export const isSyncing = computed(() => activeSyncs.value > 0)

export function startSync() {
  activeSyncs.value += 1
  let finished = false
  return () => {
    if (finished) { return }
    finished = true
    activeSyncs.value -= 1
  }
}
