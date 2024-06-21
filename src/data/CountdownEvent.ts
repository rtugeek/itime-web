import dayjs from 'dayjs'
import { Lunar } from 'lunar-typescript'
import { BaseData } from '@/data/base/BaseData'

export class CountdownEvent extends BaseData {
  name: string
  /**
   * 当前公历日期
   */
  dateTime!: Date
  /**
   * 最开始的公历日期
   */
  sourceDateTime!: Date
  /**
   * 0-不重复
   * >0 - 按天重复
   * -1 - 按周重复
   * -2 - 按月重复
   * -3 - 按年重复
   */
  periodType: number = 0
  /**
   * 0-公历
   * 1-农历
   */
  dateType: number = 0

  constructor(name: string, sourceDateTime: Date, dateType: number = 0, periodType: number = 0) {
    super()
    this.name = name
    this.setSourceDateTime(sourceDateTime)
    this.periodType = periodType
    this.dateType = dateType
  }

  setSourceDateTime(value: Date) {
    this.sourceDateTime = value
    this.dateTime = value
  }

  static fromObject(obj: any): CountdownEvent {
    const event = new CountdownEvent('', new Date())
    Object.assign(event, obj)
    return event
  }

  getDateTimeText() {
    if (this.dateType === 1) {
      return Lunar.fromDate(this.dateTime).toString()
    }
    return dayjs(this.dateTime).format('YYYY年MM月DD日')
  }

  getCountdownDays() {
    const now = dayjs()
    const dateTime = dayjs(this.dateTime)
    return Math.ceil(dateTime.diff(now, 'day', true))
  }
// /**
  //  * 计算下一个日期
  //  */
  // calcNextDateTime():Date {
  //
  // }
}
