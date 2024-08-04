import { api } from '@/api/Api'
import { Todo } from '@/data/Todo'
import type { ITodo } from '@/data/Todo'

export class TodoApi {
  static async getTodos(page: number = 1, size: number = 50): Promise<Todo[]> {
    const todo = (await api.get(`/todo?page=${page}&size=${size}`)) as ITodo[]
    return todo.map(it => Todo.fromObject(it))
  }

  static save(todo: Todo): Promise<Todo> {
    return api.post('/todo', todo)
  }

  static delete(id: number): Promise<void> {
    return api.delete(`/todo/${id}`)
  }
}
