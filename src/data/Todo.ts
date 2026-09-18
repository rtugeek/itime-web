export type TodoImportance = 'low' | 'normal' | 'high'

export interface TodoPayload {
  title: string
  dueDateTime?: string
  reminderDateTime?: string
  completedDateTime?: string
  importance?: TodoImportance
  recurrence?: string
  startDateTime?: string
  isReminderOn: boolean
}

export interface ITodo extends TodoPayload {
  userId?: number
  createdDateTime: string
  order: number
  lastModifiedDateTime: string
  /**
   * 客户端与服务器共用的记录 ID
   */
  id?: string
  uuid?: string
  createTime?: Date
  updateTime?: Date
  deleteTime?: Date
}

interface SyncMetadata {
  needSync?: boolean
  lastSyncedAt?: Date
}

export type Todo = ITodo & SyncMetadata
