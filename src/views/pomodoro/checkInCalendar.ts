import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import type { PomodoroHistory } from '@/data/PomodoroHistory'

export function buildCheckInMonth(month: Dayjs, histories: Pick<PomodoroHistory, 'startTime'>[]) {
  const checkedDates = new Set(histories
    .filter(history => dayjs(history.startTime).isValid())
    .map(history => dayjs(history.startTime).format('YYYY-MM-DD')))
  const first = month.startOf('month')
  const start = first.subtract(first.day(), 'day')
  const weekCount = Math.ceil((first.day() + first.daysInMonth()) / 7)
  const weeks = Array.from({ length: weekCount }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const date = start.add(week * 7 + weekday, 'day')
      const key = date.format('YYYY-MM-DD')
      const inMonth = date.isSame(first, 'month')
      return { key, number: date.date(), inMonth, checked: inMonth && checkedDates.has(key) }
    }))
  return {
    weeks,
    count: weeks.flat().filter(day => day.checked).length,
  }
}
