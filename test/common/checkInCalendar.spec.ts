import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import { buildCheckInMonth } from '@/views/pomodoro/checkInCalendar'

describe('打卡日历', () => {
  it('按日期去重，只统计当前月的记录', () => {
    const calendar = buildCheckInMonth(dayjs('2024-02-01'), [
      { startTime: '2024-02-01T09:00:00' },
      { startTime: '2024-02-01T15:00:00' },
      { startTime: '2024-02-29T23:00:00' },
      { startTime: '2024-01-31T09:00:00' },
      { startTime: 'invalid' },
    ])
    expect(calendar.count).toBe(2)
    expect(calendar.weeks.flat().filter(day => day.checked).map(day => day.key)).toEqual(['2024-02-01', '2024-02-29'])
    expect(calendar.weeks[0][0].key).toBe('2024-01-28')
    expect(calendar.weeks.flat().filter(day => day.inMonth)).toHaveLength(29)
  })

  it('跨年月份补全首尾周，支持六行月份和空记录', () => {
    const calendar = buildCheckInMonth(dayjs('2022-01-01'), [])
    expect(calendar.weeks).toHaveLength(6)
    expect(calendar.weeks[0][0].key).toBe('2021-12-26')
    expect(calendar.weeks[5][6].key).toBe('2022-02-05')
    expect(calendar.count).toBe(0)
  })
})
