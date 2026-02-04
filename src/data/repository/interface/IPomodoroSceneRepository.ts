import type { PomodoroScene } from '@/data/PomodoroScene'

export interface IPomodoroSceneRepository {
  get: (id: string | number) => Promise<PomodoroScene | null>
  save: (value: PomodoroScene) => Promise<PomodoroScene>
  remove: (id: string | number) => Promise<void>
  clear: () => Promise<void>
  all: () => Promise<PomodoroScene[]>
  createDefaultScenes: () => Promise<void>
  softRemove: (scene: PomodoroScene) => Promise<PomodoroScene>
}
