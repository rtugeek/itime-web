export interface PomodoroScene {
  tableId?: string
  id?: string
  createTime?: Date
  updateTime?: Date
  name: string
  duration: number
  icon: string
}

export const DefaultScenes: PomodoroScene[] = [
  {
    id: '1',
    name: '阅读',
    duration: 0,
    icon: '📖',
  },
  {
    name: '敲代码',
    icon: '👩‍💻',
    duration: 0,
  },
  {
    name: '打工',
    icon: '🔨',
    duration: 0,
  },
  {
    name: '摸鱼',
    icon: '🐟',
    duration: 0,
  },
]
