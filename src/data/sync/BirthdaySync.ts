import consola from 'consola'
import { startSync } from '@/common/syncStatus'
import type { Birthday } from '@/data/Birthday'
import { BirthdayApi } from '@/api/BirthdayApi'
import { BirthdayRepository } from '@/data/repository/BirthdayRepository'
import { useUserStore } from '@/stores/useUserStore'

export class BirthdaySync {
  static async upload(birthdays: Birthday[]) {
    try {
      const needSyncs = birthdays.filter(it => it.needSync)
      for (const birthday of needSyncs) {
        await BirthdayApi.save(birthday)
        const current = await BirthdayRepository.findOne({ id: String(birthday.id) })
        if (current && JSON.stringify(current) === JSON.stringify(birthday)) { await BirthdayRepository.save(current, false) }
      }
    }
    catch (error) {
      consola.error('Failed to upload birthdays', error)
      throw error
    }
  }

  static async download() {
    try {
      let page = 1
      let hasNext = true
      while (hasNext) {
        const result = await BirthdayApi.getBirthdays(page++)
        for (const birthday of result.data) {
          const local = await BirthdayRepository.findOne({ id: String(birthday.id) })
          if (!local?.needSync) { await BirthdayRepository.save(birthday, false) }
        }
        hasNext = result.hasNext
      }
    }
    catch (error) {
      consola.error('Failed to download birthdays', error)
      return []
    }
  }

  private static running?: Promise<void>
  private static requested = false

  static sync(): Promise<void> {
    this.requested = true
    if (!this.running) {
      this.running = (async () => {
        while (this.requested) {
          this.requested = false
          await this.syncInternal()
        }
      })().finally(() => { this.running = undefined })
    }
    return this.running
  }

  private static async syncInternal() {
    const userStore = useUserStore()
    if (!userStore.isLogin) {
      return
    }
    const finishSync = startSync()
    try {
      const birthdays = await BirthdayRepository.findAll()
      await this.upload(birthdays)
      await this.download()
    }
    catch (error) {
      consola.error('Failed to sync birthdays', error)
    }
    finally {
      finishSync()
    }
  }
}
