import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
import { useCountdownBroadcast } from '../../src/common/broadcast/useCountdownBroadcast'

class TestChannel extends EventTarget {
  static instances: TestChannel[] = []
  constructor(public name: string) {
    super()
    TestChannel.instances.push(this)
  }

  postMessage(data: unknown) {
    for (const peer of TestChannel.instances) {
      if (peer !== this && peer.name === this.name) { peer.dispatchEvent(new MessageEvent('message', { data })) }
    }
  }

  close() {
    TestChannel.instances = TestChannel.instances.filter(peer => peer !== this)
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
  TestChannel.instances = []
})

describe('countdown broadcast', () => {
  it('receives channel messages, deduplicates storage fallback, and cleans up', async () => {
    vi.stubGlobal('BroadcastChannel', TestChannel)
    const senderScope = effectScope()
    const receiverScope = effectScope()
    const onChanged = vi.fn()
    const sender = senderScope.run(() => useCountdownBroadcast())!
    const receiver = receiverScope.run(() => useCountdownBroadcast({ onChanged }))!
    await nextTick()
    await nextTick()
    const event = { type: 'delete' as const, id: '1' }
    try {
      sender.postEvent(event)
      expect(onChanged).toHaveBeenCalledTimes(1)
      expect(onChanged).toHaveBeenCalledWith(expect.objectContaining(event))

      const key = 'countdownEventStore_storage'
      window.dispatchEvent(new StorageEvent('storage', { key, newValue: localStorage.getItem(key) }))
      expect(onChanged).toHaveBeenCalledTimes(1)

      const fallback = JSON.stringify({ ...event, nonce: 42 })
      window.dispatchEvent(new StorageEvent('storage', { key, newValue: fallback }))
      expect(onChanged).toHaveBeenCalledTimes(2)

      receiver.close()
      sender.postEvent(event)
      window.dispatchEvent(new StorageEvent('storage', { key, newValue: fallback }))
      expect(onChanged).toHaveBeenCalledTimes(2)
    }
    finally {
      senderScope.stop()
      receiverScope.stop()
    }
  })
})
