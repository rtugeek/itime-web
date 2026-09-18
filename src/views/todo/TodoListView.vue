<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSortable } from '@vueuse/integrations/useSortable'
import { useSound } from '@vueuse/sound'
import { CalendarDays, ListTodo, Pencil, Plus, Repeat2, Trash2 } from '@lucide/vue'
import dayjs from 'dayjs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { useTodoStore } from '@/stores/useTodoStore'
import { RRuleUtils } from '@/utils/RRuleUtils'
import type { Todo } from '@/data/Todo'
import { delay } from '@/utils/TimeUtils'
import Ding from '@/assets/audio/ding.mp3'

const router = useRouter()
const store = useTodoStore()
const { todos, completedTodos } = storeToRefs(store)
const { play } = useSound(Ding)
const completed = ref(false)
const todoListRef = ref<HTMLElement>()

useSortable(todoListRef, todos, {
  animation: 150,
  onEnd: async () => {
    await delay(300)
    const modifiedAt = new Date().toISOString()
    for (let i = 0; i < todos.value.length; i++) {
      todos.value[i].order = i
      todos.value[i].lastModifiedDateTime = modifiedAt
    }
    await store.save()
  },
})

function goAdd() {
  router.push({ name: 'TodoAdd' })
}

function goEdit(todo: Todo) {
  router.push({ name: 'TodoAdd', query: { id: String(todo.id) } })
}

function toggleFinish(todo: Todo) {
  if (todo.completedDateTime) {
    store.reTodo(todo)
  }
  else {
    store.finishTodo(todo)
    play()
  }
}
</script>

<template>
  <main class="min-w-0 flex-1 p-3 sm:p-4">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex gap-2">
          <Button :variant="completed ? 'ghost' : 'secondary'" @click="completed = false">
            待办事项
            <Badge v-if="todos.length > 0" variant="outline" class="ml-2 tabular-nums">
              {{ todos.length }}
            </Badge>
          </Button>
          <Button :variant="completed ? 'secondary' : 'ghost'" @click="completed = true">
            已完成
            <Badge v-if="completedTodos.length > 0" variant="outline" class="ml-2 tabular-nums">
              {{ completedTodos.length }}
            </Badge>
          </Button>
        </div>
        <div class="flex items-center gap-3">
          <Button class="rounded-lg" @click="goAdd">
            <Plus class="size-4" aria-hidden="true" />
            添加事项
          </Button>
        </div>
      </header>

      <section aria-labelledby="todo-list-title" class="space-y-4">
        <div v-show="!completed">
          <div v-show="todos.length">
            <div ref="todoListRef" class="flex flex-col gap-2">
              <div
                v-for="item in todos"
                :key="item.id"
                class="draggable group flex items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-sm transition-colors hover:bg-accent/30"
                @click="goEdit(item)"
              >
                <Checkbox
                  :checked="!!item.completedDateTime"
                  @click.stop="toggleFinish(item)"
                />
                <div class="min-w-0 flex-1">
                  <p
                    class="text-base font-medium leading-tight break-words whitespace-pre-wrap line-clamp-2"
                  >
                    {{ item.title }}
                  </p>
                  <div
                    v-if="item.dueDateTime || item.recurrence"
                    class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
                  >
                    <div v-if="item.dueDateTime" class="flex items-center gap-1">
                      <CalendarDays class="size-3.5 shrink-0" />
                      <span>{{ dayjs(item.dueDateTime).format('YYYY-MM-DD') }}</span>
                    </div>
                    <div v-if="item.recurrence" class="flex items-center gap-1">
                      <Repeat2 class="size-3.5 shrink-0" />
                      <span>{{ RRuleUtils.toString(item.recurrence) }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100" @click.stop>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    class="size-8"
                    @click="goEdit(item)"
                  >
                    <Pencil class="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    class="size-8 text-destructive hover:text-destructive"
                    @click="store.deleteTodo(item)"
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <Empty v-if="!todos.length">
            <EmptyContent>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ListTodo class="size-6" aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>
                  暂无待办事项
                </EmptyTitle>
                <EmptyDescription>
                  添加一件要做的事吧
                </EmptyDescription>
              </EmptyHeader>
              <Button variant="outline" @click="goAdd">
                <Plus class="size-4" aria-hidden="true" />
                添加事项
              </Button>
            </EmptyContent>
          </Empty>
        </div>

        <div v-show="completed">
          <div v-if="completedTodos.length">
            <div class="flex flex-col gap-2">
              <div
                v-for="item in completedTodos"
                :key="item.id"
                class="group flex items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-sm transition-colors hover:bg-accent/30"
              >
                <Checkbox
                  :checked="!!item.completedDateTime"
                  @click="toggleFinish(item)"
                />
                <div class="min-w-0 flex-1" @click="goEdit(item)">
                  <p
                    class="text-base font-medium leading-tight break-words whitespace-pre-wrap line-clamp-2 text-muted-foreground line-through"
                  >
                    {{ item.title }}
                  </p>
                  <div
                    v-if="item.dueDateTime || item.recurrence"
                    class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
                  >
                    <div v-if="item.dueDateTime" class="flex items-center gap-1">
                      <CalendarDays class="size-3.5 shrink-0" />
                      <span>{{ dayjs(item.dueDateTime).format('YYYY-MM-DD') }}</span>
                    </div>
                    <div v-if="item.recurrence" class="flex items-center gap-1">
                      <Repeat2 class="size-3.5 shrink-0" />
                      <span>{{ RRuleUtils.toString(item.recurrence) }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100" @click.stop>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    class="size-8 text-destructive hover:text-destructive"
                    @click="store.deleteTodo(item)"
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <Empty v-else>
            <EmptyContent>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ListTodo class="size-6" aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>
                  还没有已完成的事项
                </EmptyTitle>
                <EmptyDescription>
                  完成更多任务吧！
                </EmptyDescription>
              </EmptyHeader>
            </EmptyContent>
          </Empty>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.draggable {
  -webkit-user-drag: element;
}
</style>
