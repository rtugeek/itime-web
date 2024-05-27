import { it, describe, expect } from 'vitest'
import { cacheApi } from '../../src/api/Api'
import { PublicEventApi } from '../../src/api/PublicEventApi'

describe('publicEventApi', () => {
  it('getCalendar', async () => {
    const res = await PublicEventApi.getCalendar()
    expect(res.length).gt(0)
  }, 30000)
})
