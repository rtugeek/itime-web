import { afterEach, expect, it, vi } from 'vitest'
import { clearMigratedStores } from '@/utils/MigrateUtil'

afterEach(() => vi.unstubAllGlobals())

it('clears only the four migrated stores and never opens pomodoro history', async () => {
  const opened: string[] = []
  const cleared: string[] = []
  vi.stubGlobal('indexedDB', {
    open(name: string) {
      opened.push(name)
      const request: Record<string, any> = {}
      queueMicrotask(() => {
        request.result = {
          close: vi.fn(),
          objectStoreNames: { contains: () => true },
          transaction() {
            const transaction: Record<string, any> = {
              objectStore: () => ({ clear: () => { cleared.push(name); return {} } }),
            }
            queueMicrotask(() => transaction.oncomplete())
            return transaction
          },
        }
        request.onsuccess()
      })
      return request
    },
  })
  await clearMigratedStores()
  expect(opened.sort()).toEqual(['birthday-v1', 'countdown-event', 'pomodoro-scene', 'todo-v1'])
  expect(cleared.sort()).toEqual(opened)
  expect(opened).not.toContain('pomodoro')
})
