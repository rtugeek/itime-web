import { describe, it } from 'vitest'
import { BirthdayWrapper } from '../../src/data/BirthdayWrapper'
import type { Birthday } from '../../src/data/Birthday'

describe('birthdayWrapper', () => {
  it('get', async () => {
    const birthday: Birthday = {
      dateType: 1,
      year: 1996,
      month: 8,
      dayOfMonth: 17,
    }
    const birthdayWrapper = new BirthdayWrapper(birthday)
    birthdayWrapper.setDateType(0)
    console.log(birthday)
  }, 30000)
})
