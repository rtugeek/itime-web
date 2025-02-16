import dayjs from 'dayjs'
import { Lunar } from 'lunar-typescript'
import type { Birthday } from '@/data/Birthday'
import { LunarUtils } from '@/utils/LunarUtils'
import { BaseRecurrentEvent } from '@/data/base/BaseRecurrentEvent'
import { RRuleUtils } from '@/utils/RRuleUtils'

export class BirthdayWrapper extends BaseRecurrentEvent {
  birthday: Birthday
  private _isToday?: boolean

  constructor(birthday: Birthday) {
    super(birthday.dateType)
    this.birthday = birthday
  }

  getNextSolarDate(): Date {
    if (this.dateType == 1) {
      return LunarUtils.lunarToDate(this.getNextLunar())
    }
    const { month, dayOfMonth } = this.birthday
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
      return new Date(this.birthday.year, this.birthday.month - 1, this.birthday.dayOfMonth)
    }
  }

  getSourceLunar(): Lunar {
    const { year, month, dayOfMonth } = this.birthday
    return LunarUtils.fromYmd(year, month, dayOfMonth)
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

  toString(dateType?: number) {
    const type = dateType ?? this.dateType
    if (type == 1) {
      return this.getNextLunar().toString().split('年')[1]
    }
    else if (type == 0) {
      return dayjs(this.getNextSolarDate()).format('YYYY年MM月DD日')
    }
  }

  setSolarDate(solarDate: Date) {
    const fullYear = solarDate.getFullYear()
    const month = solarDate.getMonth() + 1
    this.birthday.year = fullYear
    this.birthday.month = month
    this.birthday.dayOfMonth = solarDate.getDate()
  }

  setLunar(lunar: Lunar) {
    this.birthday.year = lunar.getYear()
    this.birthday.month = lunar.getMonth()
    this.birthday.dayOfMonth = lunar.getDay()
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
      const solarDate = new Date(this.birthday.year, this.birthday.month - 1, this.birthday.dayOfMonth)
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
