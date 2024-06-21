import { it, describe } from 'vitest'
import { CountdownEvent } from '../../src/data/CountdownEvent'
import dayjs from 'dayjs'

describe('countdownEvenTest', () => {
  it('get', async () => {
 const event = new CountdownEvent("",new Date())
    event.setSourceDateTime( dayjs().add(1, 'day').toDate())
    console.log(event)
    console.log(JSON.stringify(event))
  }, 30000)
})
