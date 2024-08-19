import { describe, it } from 'vitest'
import dayjs from 'dayjs'

describe('dayjs', () => {
  it('toText', () => {
    const dayjs1 = dayjs(new Date(2024, 4, 31))
    console.log(dayjs1.format('YYYY-MM-DD'))
    const dayjs2 = dayjs1.add(1, 'month')
    console.log(dayjs2.format('YYYY-MM-DD'))
  })
})
