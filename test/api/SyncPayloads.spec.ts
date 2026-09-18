import { beforeEach, expect, it, vi } from 'vitest'
import { api } from '@/api/Api'
import { UserDataApi } from '@/api/UserDataApi'

vi.mock('@/api/Api', () => ({ api: { post: vi.fn(), put: vi.fn(), delete: vi.fn(), get: vi.fn() } }))
beforeEach(() => vi.resetAllMocks())

it.each([
  ['birthday', { name: '生日', year: 2001, month: -4, dayOfMonth: 3, dateType: 1, introduction: '备注' }],
  ['countdown', { name: '纪念日', dateTime: '2026-09-12T00:00:00Z', sourceDateTime: '2020-09-12T00:00:00Z', recurrence: 'RRULE:FREQ=YEARLY' }],
  ['todo', { title: '任务', isReminderOn: false }],
  ['pomodoro_scene', { name: '阅读', icon: '📖', duration: 3600 }],
])('creates and updates %s through UserData with its string ID and payload', async (dataType, data) => {
  const body = { id: `${dataType}-id`, dataType, data, sortOrder: 0 }
  await UserDataApi.create(body)
  expect(api.post).toHaveBeenCalledWith('/user/data', body)
  await UserDataApi.update(body.id, body)
  expect(api.put).toHaveBeenCalledWith(`/user/data/${body.id}`, body)
})
