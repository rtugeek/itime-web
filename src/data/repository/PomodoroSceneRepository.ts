import { createPomodoroSceneId } from '@/data/PomodoroScene'
import type { IPomodoroScene, PomodoroScenePayload } from '@/data/PomodoroScene'
import type { UserData } from '@/data/UserData'
import { UserDataRepository } from '@/data/repository/UserDataRepository'
import { DateUtils } from '@/utils/DateUtils'

function toUserData(scene: IPomodoroScene): UserData<PomodoroScenePayload> {
  const createTime = DateUtils.toISO(scene.createTime, new Date().toISOString())
  return {
    id: scene.id || createPomodoroSceneId(),
    userId: Number(scene.userId) || 0,
    dataType: 'pomodoro_scene',
    data: {
      name: scene.name,
      icon: scene.icon,
      duration: scene.duration ?? 0,
    },
    sortOrder: scene.sortOrder ?? 0,
    createTime: new Date(createTime),
    updateTime: new Date(DateUtils.toISO(scene.updateTime, createTime)),
    deleteTime: scene.deleteTime ? new Date(DateUtils.toISO(scene.deleteTime, createTime)) : null,
    needSync: scene.needSync,
    lastSyncedAt: scene.lastSyncedAt,
  }
}

function fromUserData(item: UserData<PomodoroScenePayload>): IPomodoroScene {
  return {
    id: item.id,
    userId: String(item.userId),
    name: item.data.name,
    icon: item.data.icon,
    duration: item.data.duration ?? 0,
    sortOrder: item.sortOrder,
    createTime: new Date(item.createTime),
    updateTime: new Date(item.updateTime),
    deleteTime: item.deleteTime ? new Date(item.deleteTime) : undefined,
    needSync: item.needSync,
    lastSyncedAt: item.lastSyncedAt,
  }
}

class PomodoroSceneRepositoryClass {
  async get(key: string | number, includeRemoved = false): Promise<IPomodoroScene | null> {
    const keyStr = String(key)
    const item = await UserDataRepository.findOne<PomodoroScenePayload>({ id: keyStr })
    if (!item || item.dataType !== 'pomodoro_scene') { return null }
    if (!includeRemoved && item.deleteTime) { return null }
    return fromUserData(item)
  }

  async save(value: IPomodoroScene, preserveTime = false): Promise<IPomodoroScene> {
    if (!value.id) { value.id = createPomodoroSceneId() }
    const saved = fromUserData(await UserDataRepository.save(toUserData(value), value.needSync ?? true, preserveTime))
    Object.assign(value, saved)
    return saved
  }

  async remove(id: string | number): Promise<void> {
    const scene = await this.get(id)
    if (scene) { await UserDataRepository.remove(scene.id!) }
  }

  async softRemove(scene: IPomodoroScene): Promise<IPomodoroScene> {
    const existing = await this.get(scene.id!, true)
    if (!existing) { throw new Error('番茄场景不存在') }
    const removed = await UserDataRepository.softRemove(existing.id!)
    return fromUserData(removed as UserData<PomodoroScenePayload>)
  }

  async saveAll(scenes: IPomodoroScene[]): Promise<IPomodoroScene[]> {
    const result: IPomodoroScene[] = []
    for (const scene of scenes) {
      result.push(await this.save(scene, true))
    }
    return result
  }

  async clear(): Promise<void> {
    for (const scene of await this.all(true)) { await UserDataRepository.remove(scene.id!) }
  }

  async all(includeRemoved = false): Promise<IPomodoroScene[]> {
    return (await UserDataRepository.findByDataType<PomodoroScenePayload>('pomodoro_scene', includeRemoved))
      .map(fromUserData).sort((a, b) => a.createTime!.getTime() - b.createTime!.getTime())
  }

  async createDefaultScenes(templates: IPomodoroScene[]): Promise<void> {
    for (const template of templates) {
      if (!await this.get(template.id!, true)) {
        await this.save({ ...template, needSync: true })
      }
    }
  }
}

export const PomodoroSceneRepository = new PomodoroSceneRepositoryClass()
