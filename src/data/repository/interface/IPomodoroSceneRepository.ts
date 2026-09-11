import type { PomodoroScene } from '@/data/PomodoroScene'

export interface IPomodoroSceneRepository {
  get: (id: string | number) => Promise<PomodoroScene | null>
  save: (value: PomodoroScene, preserveTime?: boolean) => Promise<PomodoroScene>
  remove: (id: string | number) => Promise<void>
  clear: () => Promise<void>
  all: (includeRemoved?: boolean) => Promise<PomodoroScene[]>
  createDefaultScenes: () => Promise<void>
  softRemove: (scene: PomodoroScene) => Promise<PomodoroScene>
}
