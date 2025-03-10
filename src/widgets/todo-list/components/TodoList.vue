<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import { storeToRefs } from 'pinia'
import { useSound } from '@vueuse/sound'
import TodoItem from '@/widgets/todo-list/components/TodoItem.vue'
import { delay } from '@/utils/TimeUtils'
import { useTodoStore } from '@/stores/useTodoStore'
import type { Todo } from '@/data/Todo'
import Ding from '@/assets/audio/ding.mp3'

const props = defineProps({
  isCompleted: Boolean,
})
const listRef = ref<HTMLElement>()
const todoStore = useTodoStore()
const { completedTodos, todos: todoList } = storeToRefs(todoStore)
const { play } = useSound(Ding)
function finishTodo(todo: Todo) {
  if (todo.completedDateTime) {
    todoStore.reTodo(todo)
  }
  else {
    todoStore.finishTodo(todo)
    play()
  }
}

useSortable(listRef, todoStore.todos, {
  animation: 150,
  onEnd: async () => {
    await delay(300)
    for (let i = 0; i < todoStore.todos.length; i++) {
      todoStore.todos[i].order = i
    }
    todoStore.save()
  },
})

const todos = computed(() => {
  return props.isCompleted ? completedTodos.value : todoList.value
})
</script>

<template>
  <div class="wrapper">
    <div ref="listRef" class="list">
      <div v-for="item in todos" :key="`${item.id}-${item.lastModifiedDateTime}`" class="draggable">
        <TodoItem
          :editable="!isCompleted" :todo="item" @finish="finishTodo(item)" @delete="todoStore.deleteTodo(item)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.draggable{
  -webkit-user-drag: element;
}
</style>
