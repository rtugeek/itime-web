import { describe, it } from 'vitest'
import dayjs from 'dayjs'

describe('dayjs', () => {
  it('toText', () => {
    const dayjs1 = dayjs(new Date(2024, 4, 31))
    console.log(dayjs1.month())
    console.log(dayjs1.daysInMonth())
    console.log(dayjs1.format('YYYY-MM-DD'))
    const dayjs2 = dayjs1.add(1, 'month')
    console.log(dayjs2.format('YYYY-MM-DD'))
  })

  it('diffInDays', () => {
    const nextDay = dayjs(new Date(2024, 7, 29, 0, 0, 0, 0))
    const now = dayjs()
    console.log(nextDay.diff(now, 'day', true))
  })
})
