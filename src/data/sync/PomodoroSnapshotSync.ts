import { ref } from 'vue'
import type { BaseData, BaseRemoteData } from '@/data/base/BaseData'
import { SnapshotSync } from '@/data/sync/SnapshotSync'

export const pomodoroSyncRevision = ref(0)
export abstract class PomodoroSnapshotSync<T extends BaseData, R extends BaseRemoteData> extends SnapshotSync<T, R> {
  protected afterSync() { pomodoroSyncRevision.value++ }
}
