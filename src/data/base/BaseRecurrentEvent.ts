import dayjs from 'dayjs'
import type { Lunar } from 'lunar-typescript'
import { RRule } from 'rrule'
import { BaseData } from '@/data/base/BaseData'
import { LunarUtils } from '@/utils/LunarUtils'
import { RRuleUtils } from '@/utils/RRuleUtils'

export abstract class BaseRecurrentEvent extends BaseData {
  /**
   * 0-公历
   * 1-农历
   */
  dateType: number
  constructor(dateType: number) {
    super()
    this.dateType = dateType
  }

  abstract getSourceSolarDate(): Date
  abstract getSourceLunar(): Lunar
  abstract getRecurrence(): string | undefined
  abstract getCurrentSolarDate(): Date
  getNextLunar(): Lunar {
    const sourceLunar = this.getSourceLunar()
    const now = dayjs()
    const nextLunar = LunarUtils.fromYmd(now.year(), sourceLunar.getMonth(), sourceLunar.getDay())
    if (!LunarUtils.isToday(nextLunar) && LunarUtils.isBeforeNow(nextLunar) && this.getRecurrence()) {
      if (this.getRecurrence() == RRuleUtils.YEARLY_STR) {
        return LunarUtils.addYear(nextLunar)
      }
      else if (this.getRecurrence() == RRuleUtils.MONTHLY_STR) {
        return LunarUtils.addMonth(nextLunar)
      }
      else if (this.getRecurrence() == RRuleUtils.DAILY_STR) {
        return nextLunar.next(1)
      }
      else if (this.getRecurrence() == RRuleUtils.WEEKLY_STR) {
        return nextLunar.next(7)
      }
      else {
        const rule = RRule.parseString(this.getRecurrence()!)
        return nextLunar.next(rule.interval ?? 1)
      }
    }
    return nextLunar
  }

  /**
   * 获取倒计时天数，不足一天按一天计算
   */
  countdown(): number {
    const solarDate = dayjs(this.getCurrentSolarDate())
    if (solarDate.isToday()) {
      return 0
    }
    const today = dayjs()
    return Math.ceil(solarDate.diff(today, 'day', true))
  }

  isPast(): boolean {
    return this.countdown() < 0
  }

  isToday(): boolean {
    const solarDate = dayjs(this.getCurrentSolarDate())
    return solarDate.isToday()
  }

  /**
   * 倒计时是否在10天内
   */
  isTenDayLeft() {
    const leftDays = this.countdown()
    return leftDays <= 10 && leftDays > 0
  }

  getNextSolarDate(): Date {
    if (this.dateType == 1) {
      return LunarUtils.lunarToDate(this.getNextLunar())
    }
    const sourceSolarDate = this.getSourceSolarDate()
    const now = dayjs()
    const nextDate = dayjs(sourceSolarDate)
    if (!nextDate.isToday() && nextDate.isBefore(now) && this.getRecurrence()) {
      const next = RRuleUtils.next(this.getRecurrence()!, nextDate.toDate())
      if (next) {
        return next
      }
    }
    return nextDate.toDate()
  }
}
