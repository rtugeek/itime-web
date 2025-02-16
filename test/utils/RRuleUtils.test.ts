import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import { RRuleUtils } from '../../src/utils/RRuleUtils'

describe('rRuleUtils', () => {
  it('toText', () => {
    console.log(RRuleUtils.DAILY.toString())
  })

  it('next', () => {
    const before3Days = dayjs().subtract(3, 'day').toDate()
    const after3Days = dayjs().add(3, 'day').toDate()
    const daily = RRuleUtils.next(RRuleUtils.DAILY_STR)
    const daily1 = RRuleUtils.next(RRuleUtils.DAILY_STR, before3Days)
    const weekly = RRuleUtils.next(RRuleUtils.WEEKLY_STR)
    const weekly1 = RRuleUtils.next(RRuleUtils.WEEKLY_STR, before3Days)
    const weekly2 = RRuleUtils.next(RRuleUtils.WEEKLY_STR, after3Days)
    const monthly = RRuleUtils.next(RRuleUtils.MONTHLY_STR)
    console.log(daily)
    console.log(daily1)
    console.log(weekly)
    console.log(weekly1)
    console.log('weekly2', weekly2)
    console.log(monthly)
  })

  it('nextDay', () => {
    const date = dayjs('2025-01-16T16:00:00.000Z')
    const nextDate = RRuleUtils.next(RRuleUtils.DAILY_STR, date.toDate())
    console.log(nextDate)
  })
})
