import { describe, it } from 'vitest'
import { SignatureUtils } from '../../src/utils/SignatureUtils'

describe('signatureUtils', () => {
  it('toText', () => {
    const time = '1724855902370'
    const nonce = '75pa6lrhfm'
    const appKey = '1'
    console.log(SignatureUtils.sign({
      key1: 'value1',
      key2: 'value2',
    }, appKey, time, nonce),
    )
  })
})
