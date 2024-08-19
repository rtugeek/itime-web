import { describe, expect, it } from 'vitest'
import { PublicEventApi } from '../../src/api/PublicEventApi'

describe('publicEventApi', () => {
  it('getCalendar', async () => {
    const res = await PublicEventApi.getCalendar()
    expect(res.length).gt(0)
  }, 30000)
})
