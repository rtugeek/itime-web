import dayjs from 'dayjs'

export interface DeadlineConfig {
  title: string
  startTime: Date
  endTime: Date
}

export function getDefaultDeadlineConfig(): DeadlineConfig {
  const now = dayjs()
  return {
    title: 'Deadline',
    startTime: now.subtract(1, 'day').toDate(),
    endTime: now.add(1, 'day').toDate(),
  }
}
