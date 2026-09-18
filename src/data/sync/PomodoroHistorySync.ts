import { api } from '@/api/Api'
import type { PageResult } from '@/api/ApiResult'
import { UserDataSync } from '@/data/sync/UserDataSync'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'
import { PomodoroSnapshotSync } from '@/data/sync/PomodoroSnapshotSync'
import type { PomodoroHistory } from '@/data/PomodoroHistory'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'
import { useUserStore } from '@/stores/useUserStore'
import type { BaseRemoteData } from '@/data/base/BaseData'

interface HistoryDTO { id: number, sceneId: string, duration: number, startTime: string, name?: string | null, finishTime?: string | null }
function fromDTO(item: HistoryDTO): RemotePomodoroHistory {
  const finish = item.name ?? item.finishTime ?? ''
  return { id: item.id, sceneId: item.sceneId, duration: item.duration, startTime: item.startTime, finishTime: finish, createTime: item.startTime, updateTime: finish || item.startTime }
}

export interface RemotePomodoroHistory extends BaseRemoteData {
  userId?: string
  sceneId?: string
  startTime?: string
  finishTime?: string
  duration?: number
}

export class PomodoroHistorySyncImpl extends PomodoroSnapshotSync<PomodoroHistory, RemotePomodoroHistory> {
  constructor() {
    super('pomodoro_history')
  }

  getLocalItems(): Promise<PomodoroHistory[]> {
    return PomodoroHistoryRepository.all(true)
  }

  async isLogin(): Promise<boolean> {
    return useUserStore().isLogin
  }

  async getRemoteItems(): Promise<RemotePomodoroHistory[]> {
    const result: RemotePomodoroHistory[] = []
    let page = 1
    let hasNext = true
    while (hasNext) {
      // Do not use updateTime: the current history entity has no update timestamp.
      const response = await api.get<unknown, PageResult<HistoryDTO>>('/pomodoro/history', { params: { page: page++, size: 100 } })
      result.push(...response.data.map(fromDTO))
      hasNext = response.hasNext
    }
    return result
  }

  async pushToRemote(items: RemotePomodoroHistory[]): Promise<RemotePomodoroHistory[]> {
    const result: RemotePomodoroHistory[] = []
    for (const item of items) {
      // Gson @SerializedName on finishTime is currently "name" in the server entity.
      const dto: HistoryDTO = { id: Number(item.id), sceneId: item.sceneId!, duration: item.duration || 0, startTime: item.startTime!, name: item.finishTime || null }
      result.push(fromDTO(await api.post<unknown, HistoryDTO>('/pomodoro/history', dto)))
    }
    return result
  }

  async beforeSync() {
    await UserDataSync.sync()
    if (UserDataSync.error.value) { throw new Error(`场景同步未完成：${UserDataSync.error.value}`) }
  }

  async beforeUpload(history: PomodoroHistory) {
    const scene = await PomodoroSceneRepository.get(history.sceneId)
    if (!scene || scene.deleteTime) { throw new Error('记录所属场景不存在，已保留记录等待重试') }
    if (Number(scene.userId) !== useUserStore().userId) { throw new Error('记录所属场景归属异常，已保留记录等待重试') }
  }

  deleteRemote(id: number) { return api.delete<unknown, void>(`/pomodoro/history/${id}`) }

  saveItem(item: PomodoroHistory, updateNeedSync: boolean = false): Promise<PomodoroHistory> {
    item.needSync = updateNeedSync
    return PomodoroHistoryRepository.save(item, true)
  }

  mapLocalToRemote(localItems: PomodoroHistory[]): RemotePomodoroHistory[] {
    return localItems.map((localItem) => {
      const remoteItem: RemotePomodoroHistory = {
        id: localItem.id,
        sceneId: String(localItem.sceneId),
        duration: localItem.duration,
        finishTime: localItem.finishTime,
        startTime: localItem.startTime,
        updateTime: localItem.updateTime ? new Date(localItem.updateTime).toISOString() : new Date().toISOString(),
        createTime: localItem.createTime ? new Date(localItem.createTime).toISOString() : new Date().toISOString(),
      }

      if (localItem.deleteTime) {
        remoteItem.deleteTime = new Date(localItem.deleteTime).toISOString()
      }

      return remoteItem
    })
  }

  mapRemoteToLocal(remotes: RemotePomodoroHistory[]): PomodoroHistory[] {
    return remotes.map((item) => {
      const history: PomodoroHistory = {
        id: typeof item.id === 'string' ? Number.parseInt(item.id) : (item.id as number),
        sceneId: item.sceneId || '',
        duration: item.duration || 0,
        finishTime: item.finishTime || '',
        startTime: item.startTime || '',

        createTime: item.createTime ? new Date(item.createTime) : undefined,
        updateTime: item.updateTime ? new Date(item.updateTime) : undefined,
        deleteTime: item.deleteTime ? new Date(item.deleteTime) : undefined,
      }
      return history
    })
  }
}

const PomodoroHistorySync = new PomodoroHistorySyncImpl()
export { PomodoroHistorySync }
