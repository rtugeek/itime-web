import { describe, it } from 'vitest'
import { RRuleUtils } from '../../src/utils/RRuleUtils'
import dayjs from "dayjs";

describe('dayjs', () => {
  it('toText', () => {
    let dayjs1 = dayjs(new Date(2024,4,31));
    console.log(dayjs1.format('YYYY-MM-DD'))
    let dayjs2 = dayjs1.add(1,'month');
    console.log(dayjs2.format('YYYY-MM-DD'))
  })
})
