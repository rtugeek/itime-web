import type { PomodoroHistory } from '@/data/PomodoroHistory'

export interface IPomodoroHistoryRepository {
  get: (id: string) => Promise<PomodoroHistory | null>
  save: (value: PomodoroHistory) => Promise<PomodoroHistory>
  remove: (key: number) => Promise<void>
  softRemove: (history: PomodoroHistory) => Promise<void>
  removeBySceneId: (sceneId: number | string) => Promise<void>
  all: () => Promise<PomodoroHistory[]>
  clear: () => Promise<void>
  findBySceneId: (sceneId: number | string) => Promise<PomodoroHistory[]>
}
