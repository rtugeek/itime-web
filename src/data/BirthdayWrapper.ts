import dayjs from 'dayjs'
import { Lunar } from 'lunar-typescript'
import type { Birthday } from '@/data/Birthday'
import { LunarUtils } from '@/utils/LunarUtils'

export class BirthdayWrapper {
  birthday: Birthday
  private _isToday?: boolean
  private _isTenDayLeft?: boolean
  private _isOverDDL?: boolean
  constructor(birthday: Birthday) {
    this.birthday = birthday
  }

  getNextSolarDate(): Date {
    if (this.birthday.dateType == 1) {
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
    if (this.birthday.dateType == 1) {
      return LunarUtils.lunarToDate(this.getSourceLunar())
    }
    else {
      return new Date(this.birthday.year, this.birthday.month - 1, this.birthday.dayOfMonth)
    }
  }

  getNextLunar(): Lunar {
    const { month, dayOfMonth } = this.birthday
    const now = dayjs()
    let nextBirthday = LunarUtils.fromYmd(now.year(), month, dayOfMonth)
    if (!LunarUtils.isToday(nextBirthday) && LunarUtils.lunarToDayJS(nextBirthday).isBefore(now)) {
      nextBirthday = LunarUtils.addYear(nextBirthday)
    }
    return nextBirthday
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

  isTenDayLeft() {
    if (!this._isTenDayLeft) {
      const leftday=this.countdown()
      this._isTenDayLeft = leftday<=10
    }
    return this._isTenDayLeft
  }
  isOverDDL() {
    if (!this._isOverDDL) {
      const leftday=this.countdownsingle()
      this._isOverDDL = leftday<0
    }
    return this._isOverDDL
  }

  toString(dateType?: number) {
    const type = dateType ?? this.birthday.dateType
    if (type == 1) {
      return this.getNextLunar().toString().split('年')[1]
    }
    else if (type == 0) {
      return dayjs(this.getNextSolarDate()).format('YYYY年MM月DD日')
    }
    else if (type == 2) {
      return dayjs(this.getExcDay()).format('YYYY年MM月DD日')+"--DDL"
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
    const type = dateType ?? this.birthday.dateType
    if (type == 0) {
      this.setSolarDate(date)
    }
    else {
      const lunar = Lunar.fromDate(date)
      this.setLunar(lunar)
    }
    this._isToday = undefined
    this._isTenDayLeft= undefined
    this._isOverDDL=undefined
  }

  /**
   * 获取距离下一个生日的天数，不足一天按一天计算
   */
  countdown(): number {
    const solarDate = dayjs(this.getNextSolarDate())
    if (solarDate.isToday()) {
      return 0
    }
    const today = dayjs()
    return Math.ceil(solarDate.diff(today, 'day', true))
  }
  countdownsingle(): number {
    const solarDate = dayjs(this.getExcDay())
    if (solarDate.isToday()) {
      return 0
    }
    const today = dayjs()
    return Math.ceil(solarDate.diff(today, 'day', true))
  }
  getExcDay(): Date {
    if (this.birthday.dateType == 1) {
      return LunarUtils.lunarToDate(this.getLunar())
    }
    else
    {
      const { year,month, dayOfMonth } = this.birthday
      const DDLday =dayjs(new Date(year, month - 1, dayOfMonth))
      return DDLday.toDate()
    }  
  }
  getLunar(): Lunar {
    const { year,month, dayOfMonth } = this.birthday
    let nextBirthday = LunarUtils.fromYmd(year, month, dayOfMonth)
    return nextBirthday
  }

  setDateType(dateType: number) {
    const previousType = this.birthday.dateType
    this.birthday.dateType = dateType
    this.switchDateType(previousType)
  }

  switchDateType(previousType: number) {
    if (previousType == 1 && this.birthday.dateType == 0) {
      // 将农历转为公历
      const lunar = this.getSourceLunar()
      const date = LunarUtils.lunarToDate(lunar)
      this.setSolarDate(date)
    }
    else if (previousType == 0 && this.birthday.dateType == 1) {
      // 将公历转农历
      const solarDate = new Date(this.birthday.year, this.birthday.month - 1, this.birthday.dayOfMonth)
      const lunar = Lunar.fromDate(solarDate)
      this.setLunar(lunar)
    }
    this._isToday = undefined
    this._isTenDayLeft= undefined
    this._isOverDDL=undefined
  }
}
