import { api } from '@/api/Api'
import type { Todo } from '@/data/Todo'
import type { PageResult } from '@/api/ApiResult'

export class TodoApi {
  static async getTodos(page: number = 1, size: number = 50): Promise<PageResult<Todo>> {
    return (await api.get(`/todo?page=${page}&size=${size}`)) as Todo[]
  }

  static save(todo: Todo): Promise<Todo> {
    return api.post('/todo', todo)
  }

  static delete(id: number): Promise<void> {
    return api.delete(`/todo/${id}`)
  }
}
