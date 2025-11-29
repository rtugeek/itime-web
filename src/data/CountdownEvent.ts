import dayjs from 'dayjs'
import { Lunar } from 'lunar-typescript'
import { BaseRecurrentEvent } from '@/data/base/BaseRecurrentEvent'

export class CountdownEvent extends BaseRecurrentEvent {
  name: string
  /**
   * 当前公历日期 ISO格式
   */
  dateTime!: string
  /**
   * 备注
   */
  note: string
  /**
   * 最开始的公历日期 ISO格式
   */
  sourceDateTime!: string
  /**
   * 0-不重复
   * >0 - 按天重复
   * -1 - 按周重复
   * -2 - 按月重复
   * -3 - 按年重复
   * @deprecated
   */
  periodType: number = 0
  /**
   * rrule格式的重复规则
   */
  recurrence?: string
  /**
   * 0-公历
   * 1-农历
   */
  dateType: number = 0

  constructor(name: string, sourceDateTime: Date, dateType: number = 0, recurrence?: string, note?: string) {
    super(dateType)
    this.name = name
    this.setSourceDateTime(sourceDateTime)
    this.recurrence = recurrence
    this.dateType = dateType
    this.note = note || ''
  }

  setSourceDateTime(value: Date) {
    this.sourceDateTime = value.toISOString()
    this.dateTime = value.toISOString()
  }

  static fromObject(obj: any): CountdownEvent {
    const event = new CountdownEvent('', new Date())
    Object.assign(event, obj)
    return event
  }

  getDateTimeText() {
    if (this.dateType === 1) {
      return Lunar.fromDate(dayjs(this.dateTime).toDate()).toString()
    }
    return dayjs(this.dateTime).format('YYYY年MM月DD日')
  }

  getCountdownDays() {
    const now = dayjs()
    const dateTime = dayjs(this.dateTime)
    return Math.ceil(dateTime.diff(now, 'day', true))
  }

  getRecurrence(): string | undefined {
    return this.recurrence
  }

  getSourceLunar(): Lunar {
    const sourceSolarDate = this.getSourceSolarDate()
    return Lunar.fromDate(sourceSolarDate)
  }

  getSourceSolarDate(): Date {
    return dayjs(this.sourceDateTime).toDate()
  }

  getCurrentSolarDate(): Date {
    return dayjs(this.dateTime).toDate()
  }
}
