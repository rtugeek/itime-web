import consola from 'consola'
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
        await BirthdayRepository.save(birthday, false)
      }
    }
    catch (error) {
      consola.error('Failed to upload birthdays', error)
    }
  }

  static async download() {
    try {
      const result = await BirthdayApi.getBirthdays()
      const list = result.data
      await BirthdayRepository.saveAll(list, false)
    }
    catch (error) {
      consola.error('Failed to download birthdays', error)
      return []
    }
  }

  static async sync() {
    const userStore = useUserStore()
    if (!userStore.isLogin) {
      return
    }
    try {
      const birthdays = await BirthdayRepository.findAll()
      await this.upload(birthdays)
      await this.download()
    }
    catch (error) {
      consola.error('Failed to sync birthdays', error)
    }
  }
}
