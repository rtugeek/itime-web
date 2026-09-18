import dayjs from 'dayjs'
import { nanoid } from 'nanoid'
import { Lunar } from 'lunar-typescript'
import { LunarUtils } from '@/utils/LunarUtils'
import { BaseRecurrentEvent } from '@/data/base/BaseRecurrentEvent'
import { RRuleUtils } from '@/utils/RRuleUtils'

export interface BirthdayPayload {
  name: string
  year: number
  /**
   * 负数代表闰月；从1开始
   */
  month: number
  /**
   * 从1开始
   */
  dayOfMonth: number
  /**
   * 0-公历 1-农历
   */
  dateType: number
  introduction: string
}

export interface IBirthday extends BirthdayPayload {
  dataType: 'birthday'
  /**
   * 客户端与服务器共用的记录 ID
   */
  id: string
  userId?: number
  deleteTime?: Date | null
  createTime: Date
  updateTime: Date
  sortOrder: number
  needSync?: boolean
  lastSyncedAt?: Date
}

export class Birthday extends BaseRecurrentEvent implements IBirthday {
  dataType = 'birthday' as const
  declare id: string
  declare userId?: number
  declare createTime: Date
  declare updateTime: Date
  deleteTime?: Date
  sortOrder: number = 0
  needSync?: boolean
  lastSyncedAt?: Date
  name: string
  year: number
  /**
   * 负数代表闰月；从1开始
   */
  month: number
  /**
   * 从1开始
   */
  dayOfMonth: number
  introduction: string

  private _isToday?: boolean

  constructor(birthday: IBirthday) {
    super(birthday.dateType)
    this.id = birthday.id
    this.userId = birthday.userId
    this.createTime = birthday.createTime
    this.updateTime = birthday.updateTime
    this.deleteTime = birthday.deleteTime ?? undefined
    this.sortOrder = birthday.sortOrder ?? 0
    this.needSync = birthday.needSync
    this.lastSyncedAt = birthday.lastSyncedAt
    this.name = birthday.name
    this.year = birthday.year
    this.month = birthday.month
    this.dayOfMonth = birthday.dayOfMonth
    this.introduction = birthday.introduction ?? ''
  }

  static create(title: string = ''): Birthday {
    const now = dayjs().subtract(10, 'years').toDate()
    const id = nanoid()
    return new Birthday({
      id,
      userId: 0,
      dataType: 'birthday',
      createTime: now,
      dateType: 0,
      name: title,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      dayOfMonth: now.getDate(),
      updateTime: now,
      introduction: '',
      sortOrder: 0,
      needSync: true,
    })
  }

  getNextSolarDate(): Date {
    if (this.dateType == 1) {
      return LunarUtils.lunarToDate(this.getNextLunar())
    }
    const { month, dayOfMonth } = this
    const now = dayjs()
    const nextBirthday = dayjs(new Date(now.year(), month - 1, dayOfMonth))
    if (!nextBirthday.isToday() && nextBirthday.isBefore(now)) {
      return nextBirthday.add(1, 'years').toDate()
    }
    return nextBirthday.toDate()
  }

  getSourceSolarDate(): Date {
    if (this.dateType == 1) {
      return LunarUtils.lunarToDate(this.getSourceLunar())
    }
    else {
      return new Date(this.year, this.month - 1, this.dayOfMonth)
    }
  }

  getSourceLunar(): Lunar {
    return LunarUtils.fromYmd(this.year, this.month, this.dayOfMonth)
  }

  isToday() {
    if (!this._isToday) {
      const solarDate = this.getNextSolarDate()
      const today = new Date()
      this._isToday = solarDate.getFullYear() == today.getFullYear()
        && solarDate.getMonth() == today.getMonth()
        && solarDate.getDate() == today.getDate()
    }
    return this._isToday
  }

  format(dateType?: number): string {
    const type = dateType ?? this.dateType
    if (type == 1) {
      return this.getNextLunar().toString().split('年')[1]
    }
    else if (type == 0) {
      return dayjs(this.getNextSolarDate()).format('YYYY年MM月DD日')
    }
    return ''
  }

  setSolarDate(solarDate: Date) {
    this.year = solarDate.getFullYear()
    this.month = solarDate.getMonth() + 1
    this.dayOfMonth = solarDate.getDate()
  }

  setLunar(lunar: Lunar) {
    this.year = lunar.getYear()
    this.month = lunar.getMonth()
    this.dayOfMonth = lunar.getDay()
  }

  /**
   *
   * @param date
   * @param dateType date 的日期类型，如果是公历则为 0，农历则为 1
   */
  setDate(date: Date, dateType?: number) {
    const type = dateType ?? this.dateType
    if (type == 0) {
      this.setSolarDate(date)
    }
    else {
      const lunar = Lunar.fromDate(date)
      this.setLunar(lunar)
    }
  }

  setDateType(dateType: number) {
    const previousType = this.dateType
    this.dateType = dateType
    this.switchDateType(previousType)
  }

  switchDateType(previousType: number) {
    if (previousType == 1 && this.dateType == 0) {
      // 将农历转为公历
      const lunar = this.getSourceLunar()
      const date = LunarUtils.lunarToDate(lunar)
      this.setSolarDate(date)
    }
    else if (previousType == 0 && this.dateType == 1) {
      // 将公历转农历
      const solarDate = new Date(this.year, this.month - 1, this.dayOfMonth)
      const lunar = Lunar.fromDate(solarDate)
      this.setLunar(lunar)
    }
    this._isToday = undefined
  }

  getCurrentSolarDate(): Date {
    return this.getNextSolarDate()
  }

  getRecurrence(): string | undefined {
    return RRuleUtils.YEARLY_STR
  }
}
