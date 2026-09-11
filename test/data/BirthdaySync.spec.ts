import { beforeEach, expect, it, vi } from 'vitest'
import { BirthdaySync } from '@/data/sync/BirthdaySync'
import { BirthdayApi } from '@/api/BirthdayApi'
import { BirthdayRepository } from '@/data/repository/BirthdayRepository'

vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => ({ isLogin: true }) }))
vi.mock('@/api/BirthdayApi', () => ({ BirthdayApi: { save: vi.fn(), getBirthdays: vi.fn() } }))
vi.mock('@/data/repository/BirthdayRepository', () => ({ BirthdayRepository: { findAll: vi.fn(), findOne: vi.fn(), save: vi.fn() } }))
beforeEach(() => vi.resetAllMocks())
it('does not download after upload failure', async () => {
  vi.mocked(BirthdayRepository.findAll).mockResolvedValue([{ id: 1, needSync: true } as any])
  vi.mocked(BirthdayApi.save).mockRejectedValue(new Error('offline'))
  await BirthdaySync.sync()
  expect(BirthdayApi.getBirthdays).not.toHaveBeenCalled()
  expect(BirthdayRepository.save).not.toHaveBeenCalled()
})
it('keeps dirty local birthdays while fetching every page', async () => {
  vi.mocked(BirthdayRepository.findAll).mockResolvedValue([])
  vi.mocked(BirthdayRepository.findOne).mockResolvedValueOnce({ id: 1, needSync: true } as any).mockResolvedValueOnce(undefined)
  vi.mocked(BirthdayApi.getBirthdays).mockResolvedValueOnce({ data: [{ id: 1 }], hasNext: true } as any).mockResolvedValueOnce({ data: [{ id: 2 }], hasNext: false } as any)
  await BirthdaySync.sync()
  expect(BirthdayApi.getBirthdays).toHaveBeenCalledTimes(2)
  expect(BirthdayRepository.save).toHaveBeenCalledTimes(1)
  expect(BirthdayRepository.save).toHaveBeenCalledWith({ id: 2 }, false)
})
