import { onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import consola from 'consola'
import type { BroadcastEvent } from '@widget-js/core'
import { NotificationApi } from '@widget-js/core'
import { useAppBroadcast } from '@widget-js/vue3'
import { useTodoStore } from '@/stores/useTodoStore'
import type { Todo } from '@/data/Todo'
import { TodoRepository } from '@/data/repository/TodoRepository'
import { useTodoBroadcast } from '@/common/broadcast/useTodoBroadcast'

interface ReminderTimeout {
  todoId: number
  timeoutId: number
}

export function useTodoReminder() {
  const todoStore = useTodoStore()
  const todoRepository = new TodoRepository()
  const timeouts = new Map<number, ReminderTimeout>()
  let currentNotifyTodo: Todo = null

  /**
   * 检查todo的提醒相关字段是否有变化
   */
  function hasReminderChanged(oldTodo: Todo | null | undefined, newTodo: Todo): boolean {
    if (!oldTodo) { return true }
    return (
      oldTodo.isReminderOn !== newTodo.isReminderOn
      || oldTodo.reminderDateTime !== newTodo.reminderDateTime
      || oldTodo.completedDateTime !== newTodo.completedDateTime
    )
  }

  // 监听todo变化
  useTodoBroadcast({
    onUpdated: async (todo) => {
      const existingTodo = await TodoRepository.findOne({ id: todo.id.toString() })
      // 只有在提醒相关的字段变化时才更新提醒
      if (hasReminderChanged(existingTodo, todo)) {
        updateReminder(todo.id)
      }
    },
    onDeleted: (todo) => {
      clearReminder(todo.id)
    },
    onInserted: (todo) => {
      // 新增的todo如果有提醒，则设置提醒
      if (todo.isReminderOn && todo.reminderDateTime) {
        setReminder(todo)
      }
    },
  })

  /**
   * 计算下一次提醒的时间间隔（毫秒）
   */
  function getNextReminderDelay(reminderDateTime: string): number {
    const now = dayjs()
    const reminderTime = dayjs(reminderDateTime)
    return Math.max(0, reminderTime.diff(now))
  }

  useAppBroadcast(['reminder-confirm'], (event: BroadcastEvent) => {
    if (event.event == 'reminder-confirm') {
      todoStore.finishTodo(currentNotifyTodo)
    }
  })

  /**
   * 设置单个提醒
   */
  function setReminder(todo: Todo) {
    // 如果已经完成或者没有开启提醒，则不设置
    if (todo.completedDateTime || !todo.isReminderOn || !todo.reminderDateTime) {
      return
    }

    // 计算延迟时间
    const delay = getNextReminderDelay(todo.reminderDateTime)
    // 如果提醒时间已经过去，则不设置
    if (delay <= 0) {
      return
    }

    // 清除已存在的提醒
    clearReminder(todo.id)

    // 设置新的提醒
    const timeoutId = window.setTimeout(() => {
      NotificationApi.reminder({
        title: '待办事项提醒',
        message: todo.title,
        duration: 30000,
        icon: 'flag',
        cancelButtonText: '知道了',
        cancelBroadcast: 'reminder-cancel',
        confirmBroadcast: `reminder-confirm`,
        confirmButtonText: '已完成',
      })
      currentNotifyTodo = todo
      // 提醒后清除timeout记录
      timeouts.delete(todo.id)
    }, delay)

    // 保存timeout信息
    timeouts.set(todo.id, {
      todoId: todo.id,
      timeoutId,
    })

    consola.info(`Set reminder for todo ${todo.id}, will trigger in ${delay}ms`)
  }

  /**
   * 清除单个提醒
   */
  function clearReminder(todoId: number) {
    const timeout = timeouts.get(todoId)
    if (timeout) {
      window.clearTimeout(timeout.timeoutId)
      timeouts.delete(todoId)
      consola.info(`Cleared reminder for todo ${todoId}`)
    }
  }

  /**
   * 清除所有提醒
   */
  function clearAllReminders() {
    for (const timeout of timeouts.values()) {
      window.clearTimeout(timeout.timeoutId)
    }
    timeouts.clear()
    consola.info('Cleared all reminders')
  }

  /**
   * 更新提醒
   * 当todo的提醒时间或状态发生变化时调用
   */
  async function updateReminder(todoId: number) {
    const todo = await todoStore.find(todoId.toString())
    if (todo) {
      setReminder(todo)
    }
    else {
      clearReminder(todoId)
    }
  }

  /**
   * 初始化所有提醒
   */
  async function initializeReminders() {
    const todos = await TodoRepository.findReminderOn()
    for (const todo of todos) {
      setReminder(todo)
    }
    consola.info(`Initialized ${todos.length} reminders`)
  }

  // 组件挂载时初始化提醒
  onMounted(() => {
    initializeReminders()
  })

  // 组件卸载时清除所有提醒
  onUnmounted(() => {
    clearAllReminders()
  })

  return {
    setReminder,
    clearReminder,
    updateReminder,
    clearAllReminders,
  }
}
