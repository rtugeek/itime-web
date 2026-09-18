let lastSceneId = 0

/** 使用毫秒时间戳，同一毫秒内连续创建时递增，避免 ID 重复。 */
export function createPomodoroSceneId(): string {
  lastSceneId = Math.max(Date.now(), lastSceneId + 1)
  return String(lastSceneId)
}

export interface IPomodoroScene {
  /** 客户端与服务器共用的数字字符串 ID，兼容历史记录的 BIGINT sceneId */
  id?: string
  userId?: number | string
  createTime?: Date
  updateTime?: Date
  deleteTime?: Date
  needSync?: boolean
  lastSyncedAt?: Date
  sortOrder?: number
  name: string
  duration: number
  icon: string
}

export type PomodoroScenePayload = Pick<IPomodoroScene, 'name' | 'duration' | 'icon'>

export const DefaultScenes: IPomodoroScene[] = [
  {
    id: createPomodoroSceneId(),
    name: '阅读',
    duration: 0,
    icon: '📖',
  },
  {
    id: createPomodoroSceneId(),
    name: '敲代码',
    icon: '👨‍💻',
    duration: 0,
  },
  {
    id: createPomodoroSceneId(),
    name: '打工',
    icon: '🔨',
    duration: 0,
  },
  {
    id: createPomodoroSceneId(),
    name: '摸鱼',
    icon: '🐟',
    duration: 0,
  },
]
