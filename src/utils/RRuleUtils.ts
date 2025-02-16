import { RRule } from 'rrule'
import dayjs from 'dayjs'

export class RRuleUtils {
  static DAILY = new RRule({ freq: RRule.DAILY })
  static DAILY_STR = this.DAILY.toString()
  static WEEKLY = new RRule({ freq: RRule.WEEKLY })
  static WEEKLY_STR = this.WEEKLY.toString()
  static MONTHLY = new RRule({ freq: RRule.MONTHLY })
  static MONTHLY_STR = this.MONTHLY.toString()
  static YEARLY = new RRule({ freq: RRule.YEARLY })
  static YEARLY_STR = this.YEARLY.toString()

  static toString(rule?: string): string {
    if (rule == this.DAILY_STR) { return '每天重复' }
    if (rule == this.WEEKLY_STR) { return '每周重复' }
    if (rule == this.MONTHLY_STR) { return '每月重复' }
    if (rule == this.YEARLY_STR) { return '每年重复' }
    return ''
  }

  static next(str: string, startDate?: Date, afterDate?: Date): Date | null {
    const now = dayjs()
    const option = RRule.parseString(str)
    const today = now.toDate()
    const rule = new RRule({
      ...option,
      dtstart: startDate ?? today,
    })
    return rule.after(afterDate ?? today)
  }
}
