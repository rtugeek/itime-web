export interface PomodoroScene {
  id?: string
  createTime?: Date
  updateTime?: Date
  name: string
  icon: string
}

export const DefaultScenes: PomodoroScene[] = [
  {
    id: '1',
    name: '阅读',
    icon: '📖',
  },
  {
    name: '敲代码',
    icon: '👩‍💻',
  },
  {
    name: '打工',
    icon: '🔨',
  },
  {
    name: '摸鱼',
    icon: '🐟',
  },
]
