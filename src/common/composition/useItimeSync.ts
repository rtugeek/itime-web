import { useIntervalFn } from '@vueuse/core'
import type { BaseSync } from '@/data/sync/BaseSync'
import type { BaseData, BaseRemoteData } from '@/data/base/BaseData'

export function useItimeSync<T extends BaseData, R extends BaseRemoteData>(sync: BaseSync<T, R>) {
  useIntervalFn(() => {
    sync.sync()
  }, 30 * 60 * 1000, { immediate: true, immediateCallback: true })
}
