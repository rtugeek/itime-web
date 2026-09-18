import { describe, expect, it } from 'vitest'
import { Birthday } from '../../src/data/Birthday'

describe('birthday', () => {
  it('preserves the id when converting a lunar birthday to solar and back', () => {
    const data = { ...Birthday.create('生日'), dateType: 1, year: 1996, month: 8, dayOfMonth: 17 }
    const birthday = new Birthday(data)
    birthday.setDateType(0)
    expect(birthday.dateType).toBe(0)
    expect(birthday.id).toBe(data.id)
    birthday.setDateType(1)
    expect(birthday).toMatchObject({ id: data.id, year: 1996, month: 8, dayOfMonth: 17 })
  })
})
