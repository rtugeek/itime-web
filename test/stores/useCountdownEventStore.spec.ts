import { beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import { CountdownEvent } from '@/data/CountdownEvent'
import { CountdownEventRepository } from '@/data/repository/CountdownEventRepository'
import { useCountdownEventStore } from '@/stores/useCountdownEventStore'
import { UserDataSync } from '@/data/sync/UserDataSync'

dayjs.extend(isToday)
const state = vi.hoisted(() => ({ user: { userId: 1 } }))
vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => state.user }))
vi.mock('@widget-js/vue3', () => ({ useWidgetStorage: (_key: string, value: string) => ref(value) }))
vi.mock('@vueuse/core', () => ({ useDebounceFn: (fn: any) => fn, useEventListener: vi.fn(), useIntervalFn: vi.fn() }))
vi.mock('@/common/broadcast/useCountdownBroadcast', () => ({ useCountdownBroadcast: () => ({ postEvent: vi.fn() }) }))
vi.mock('@/data/sync/UserDataSync', () => {
  const revision = ref(0)
  return { UserDataSync: { sync: vi.fn(), revision, busy: ref(false), error: ref('') } }
})
vi.mock('@/data/repository/CountdownEventRepository', () => ({ CountdownEventRepository: {
  all: vi.fn(),
  save: vi.fn(),
  saveAll: vi.fn(),
  createDefaultCountdown: vi.fn(),
} }))
beforeEach(() => {
  vi.resetAllMocks()
  state.user.userId = 1
  setActivePinia(createPinia())
  vi.mocked(CountdownEventRepository.createDefaultCountdown).mockResolvedValue()
  vi.mocked(CountdownEventRepository.all).mockResolvedValue([])
})
it('retains manual ordering when sync reloads the list', async () => {
  const first = new CountdownEvent('first', new Date('2098-01-01'))
  const second = new CountdownEvent('second', new Date('2099-01-01'))
  vi.mocked(CountdownEventRepository.all).mockResolvedValue([first, second])
  vi.mocked(CountdownEventRepository.saveAll).mockImplementation(async rows => rows)
  const store = useCountdownEventStore()
  await flushPromises()

  const saved = await store.saveAll([store.events[1], store.events[0]])
  expect(saved.map(item => [item.name, item.sortOrder])).toEqual([['second', 0], ['first', 1]])
  expect(CountdownEventRepository.saveAll).toHaveBeenCalledWith(expect.any(Array), true)

  vi.mocked(CountdownEventRepository.all).mockResolvedValue([...saved].reverse())
  UserDataSync.revision.value++
  await flushPromises()
  expect(store.events.map(item => item.name)).toEqual(['second', 'first'])
})
it('keeps repository rows visible when a recurrence rule is invalid', async () => {
  const bad = new CountdownEvent('bad rule', new Date('2000-01-01'), 0, 'INVALID=RULE')
  const good = new CountdownEvent('normal', new Date('2099-01-01'))
  vi.mocked(CountdownEventRepository.all).mockResolvedValue([bad, good])
  const store = useCountdownEventStore()
  await flushPromises()
  expect(store.events).toHaveLength(2)
  expect(store.loadError).toContain('重复日期')
})
it('keeps the original date visible if saving the next occurrence fails', async () => {
  const event = new CountdownEvent('yearly', new Date('2000-01-01'), 0, 'FREQ=YEARLY')
  vi.mocked(CountdownEventRepository.all).mockResolvedValue([event])
  vi.mocked(CountdownEventRepository.save).mockRejectedValue(new Error('write failed'))
  const store = useCountdownEventStore()
  await flushPromises()
  expect(store.events).toHaveLength(1)
  expect(store.events[0].dateTime).toBe(event.dateTime)
  expect(store.loadError).toContain('重复日期')
})
it('reports account filtering without exposing another account records', async () => {
  const event = new CountdownEvent('other account', new Date())
  event.userId = 2
  vi.mocked(CountdownEventRepository.all).mockResolvedValue([event])
  const store = useCountdownEventStore()
  await flushPromises()
  expect(store.events).toHaveLength(0)
  expect(store.hiddenByAccountCount).toBe(1)
  expect(store.loadError).toBe('')
})
it('reports read failures instead of silently presenting an empty list', async () => {
  vi.mocked(CountdownEventRepository.all).mockRejectedValue(new Error('read failed'))
  const store = useCountdownEventStore()
  await flushPromises()
  expect(store.loadError).toContain('read failed')
  expect(store.loading).toBe(false)
})
it('shows the supplied countdown when its userId matches the logged-in user', async () => {
  state.user.userId = 100294207
  const event = CountdownEvent.fromObject({
    id: '4mnB9RxvtHjHErjIGMqB3',
    userId: 100294207,
    name: '123123',
    note: '',
    dateTime: '2026-09-11T15:19:13.354Z',
    sourceDateTime: '2026-09-11T15:19:13.354Z',
    dateType: 0,
    deleteTime: undefined,
    needSync: false,
  })
  vi.mocked(CountdownEventRepository.all).mockResolvedValue([event])
  const store = useCountdownEventStore()
  await flushPromises()
  expect(store.events.map(it => it.id)).toEqual(['4mnB9RxvtHjHErjIGMqB3'])
  expect(store.hiddenByAccountCount).toBe(0)
  expect(store.loadError).toBe('')
})
