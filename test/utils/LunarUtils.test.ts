import { describe, expect, it } from 'vitest'
import { Lunar } from 'lunar-typescript'
import { LunarUtils } from '../../src/utils/LunarUtils'

describe('lunarUtils', () => {
  it('lunarToDate', () => {
    const lunar = Lunar.fromYmd(2024, 5, 16)
    const date = LunarUtils.lunarToDate(lunar)
    console.log(date.toISOString())
    expect(date.toISOString()).toBe('2024-06-20T16:00:00.000Z')
  })
})
