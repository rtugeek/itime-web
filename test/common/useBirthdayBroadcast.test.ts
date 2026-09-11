import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
import { useBirthdayBroadcast } from '../../src/common/broadcast/useBirthdayBroadcast'
import { AppConfig } from '../../src/common/AppConfig'
import type { Birthday } from '../../src/data/Birthday'

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

describe('birthday broadcast', () => {
  it('receives channel messages, deduplicates storage fallback, and cleans up', async () => {
    vi.stubGlobal('BroadcastChannel', TestChannel)
    const senderScope = effectScope()
    const receiverScope = effectScope()
    const onUpdated = vi.fn()
    const sender = senderScope.run(() => useBirthdayBroadcast())!
    const receiver = receiverScope.run(() => useBirthdayBroadcast({ onUpdated }))!
    await nextTick()
    await nextTick()
    const birthday = { id: 1 } as Birthday
    try {
      sender.postEvent({ type: 'update', data: birthday })
      expect(onUpdated).toHaveBeenCalledTimes(1)
      expect(onUpdated).toHaveBeenCalledWith(birthday)

      const key = `${AppConfig.CHANNEL_BIRTHDAY}_storage`
      window.dispatchEvent(new StorageEvent('storage', { key, newValue: localStorage.getItem(key) }))
      expect(onUpdated).toHaveBeenCalledTimes(1)

      const fallback = JSON.stringify({ type: 'update', data: birthday, nonce: 42 })
      window.dispatchEvent(new StorageEvent('storage', { key, newValue: fallback }))
      expect(onUpdated).toHaveBeenCalledTimes(2)

      receiver.close()
      sender.postEvent({ type: 'update', data: birthday })
      window.dispatchEvent(new StorageEvent('storage', { key, newValue: fallback }))
      expect(onUpdated).toHaveBeenCalledTimes(2)
    }
    finally {
      senderScope.stop()
      receiverScope.stop()
    }
  })
})
