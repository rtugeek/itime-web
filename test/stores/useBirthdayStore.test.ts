import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { BirthdayRepository } from '@/data/repository/BirthdayRepository'
import { BirthdayUtils } from '@/utils/BirthdayUtils'
import { useBirthdayStore } from '@/stores/useBirthdayStore'

const { post } = vi.hoisted(() => ({ post: vi.fn() }))

vi.mock('@/common/broadcast/useBirthdayBroadcast', () => ({
  useBirthdayBroadcast: () => ({ postEvent: post }),
}))
vi.mock('@/data/db', () => ({ migrateBirthday: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/data/sync/BirthdaySync', () => ({ BirthdaySync: { sync: vi.fn() } }))
vi.mock('@/data/repository/BirthdayRepository', () => ({
  BirthdayRepository: {
    findAll: vi.fn().mockResolvedValue([]),
    save: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  setActivePinia(createPinia())
})

describe('birthday store save', () => {
  it('adds the persisted birthday locally without receiving a broadcast', async () => {
    const store = useBirthdayStore()
    await flushPromises()
    const birthday = { ...BirthdayUtils.new('Alice'), id: 0 }
    const saved = { ...birthday, id: 42, needSync: true, updateTime: '2026-09-10T00:00:00Z' }
    vi.mocked(BirthdayRepository.save).mockResolvedValueOnce(saved)

    await store.save(birthday)

    expect(store.birthdayList).toEqual([saved])
    expect(post).toHaveBeenCalledWith({ type: 'update', data: saved })
  })

  it('updates an existing birthday without duplication when broadcasting is disabled', async () => {
    const store = useBirthdayStore()
    await flushPromises()
    const birthday = BirthdayUtils.new('Alice')
    store.birthdayList.push(birthday)
    const saved = { ...birthday, name: 'Bob', needSync: true }
    vi.mocked(BirthdayRepository.save).mockResolvedValueOnce(saved)

    await store.save(saved, { sync: false, sort: true, broadcast: false })

    expect(store.birthdayList).toEqual([saved])
    expect(post).not.toHaveBeenCalled()
  })
})
