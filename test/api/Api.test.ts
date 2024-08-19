import { describe, it } from 'vitest'
import { cacheApi } from '../../src/api/Api'

describe('api', () => {
  it('get', async () => {
    try {
      const res = await cacheApi.get('/event/public/calendar')
      // const res1 = await cacheApi.get('/event/public/calendar')
      // console.log(res.data)
    }
    catch (e) {
      console.error(e)
    }
  }, 30000)
})
