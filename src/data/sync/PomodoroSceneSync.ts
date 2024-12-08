import dayjs from 'dayjs'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'
import { PomodoroSceneApi } from '@/api/PomodoroSceneApi'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'

export class PomodoroSceneSync {
  static async sync() {
    await this.upload()
    await this.download()
  }

  static async upload() {
    const scenes = await PomodoroSceneRepository.all()
    for (const scene of scenes) {
      if (!scene.tableId || scene.needSync == undefined || scene.needSync) {
        const res = await PomodoroSceneApi.save(scene)
        scene.tableId = res.tableId
        scene.needSync = false
        await PomodoroSceneApi.save(scene)
      }
    }
  }

  static async download() {
    const serverScenes = await PomodoroSceneApi.find()
    const localScenes = await PomodoroSceneRepository.all()
    // 本地有，服务器没有的，删除本地
    for (const localScene of localScenes) {
      if (!serverScenes.data.find(it => it.tableId == localScene.tableId)) {
        await PomodoroSceneRepository.remove(localScene.id!)
      }
    }
    for (const scene of serverScenes.data) {
      // 本地没有，服务器有的，保存到本地
      const localScene = localScenes.find(it => it.id == scene.id)
      if (localScene) {
        if (dayjs(scene.updateTime).isAfter(dayjs(scene.updateTime))) {
          scene.needSync = false
          await PomodoroSceneRepository.save(scene)
        }
      }
      else {
        scene.needSync = false
        await PomodoroSceneRepository.save(scene)
      }
    }
  }
}
