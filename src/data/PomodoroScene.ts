import type { BaseData } from '@/data/base/BaseData'

export interface PomodoroScene extends BaseData {
  tableId?: string
  id?: number
  createTime?: Date
  updateTime?: Date
  deleteTime?: Date
  name: string
  duration: number
  icon: string
  userId?: string
  needSync?: boolean
}

export const DefaultScenes: PomodoroScene[] = [
  {
    id: 1,
    name: '阅读',
    duration: 0,
    icon: '📖',
  },
  {
    id: 2,
    name: '敲代码',
    icon: '👩‍💻',
    duration: 0,
  },
  {
    id: 2,
    name: '打工',
    icon: '🔨',
    duration: 0,
  },
  {
    id: 3,
    name: '摸鱼',
    icon: '🐟',
    duration: 0,
  },
]
