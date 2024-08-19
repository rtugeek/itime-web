<script lang="ts" setup>
import { computed } from 'vue'
import {
  Delete,
  Edit,
  PlayCycle,
  Time,
} from '@icon-park/vue-next'
import dayjs from 'dayjs'
import { RRuleUtils } from '../../../utils/RRuleUtils'
import { Todo } from '@/data/Todo'
import { WindowUtils } from '@/utils/WindowUtils'

const props = defineProps({
  todo: {
    type: Todo,
    required: true,
  },
  editable: { type: Boolean },
})

const emits = defineEmits(['finish', 'edit', 'delete'])

function finish() {
  emits('finish', props.todo)
}

function edit() {
  WindowUtils.open(`/todo/add?id=${props.todo.id}`)
}

function deleteTodo() {
  emits('delete', props.todo)
}

const isCompleted = computed(() => {
  return !!props.todo.completedDateTime
})
</script>

<template>
  <div class="todo-item">
    <div class="flex items-center">
      <ElCheckbox :checked="isCompleted" @click="finish">
        <span />
      </ElCheckbox>
      <div class="todo" style="line-height: 1.2">
        <p :style=" { 'text-decoration': isCompleted ? 'line-through' : 'none' }">
          {{ todo.title }}
        </p>
        <div class="flex text-xs items-center gap-3" style="font-weight: normal">
          <div v-if="todo.dueDateTime" class="items-center justify-center flex gap-1">
            <Time class="icon" size="12" /> {{ dayjs(todo.dueDateTime).format('YYYY-MM-DD') }}
          </div>
          <div v-if="todo.recurrence" class="items-center flex gap-1">
            <PlayCycle size="12" /> {{ RRuleUtils.toString(todo.recurrence) }}
          </div>
        </div>
      </div>
      <div class="actions flex items-center">
        <div
          v-if="editable"
          class="icon click-spot flex justify-center"
          style="height: 100%; width: 24px"
          @click.stop="edit"
        >
          <Edit class="edit" />
        </div>
        <div class="icon delete" @click.stop="deleteTodo">
          <Delete />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.el-checkbox.is-checked {
  .todo {
    text-decoration-line: line-through;
  }
}

p {
  font-weight: normal;
  margin: 0;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.todo-item {
  font-size: 1rem;
  background-color: color(from var(--widget-background-color) srgb r g b / 0.2);
  border-radius: 4px;
  height: 3rem;
  display: flex;
  position: relative;
  justify-items: center;
  padding: 0 12px;
  &:hover {
    .actions {
      opacity: 1;
    }
  }

  .todo{
    p{
      width: 70vw;
    }
  }

  .actions {
    cursor: pointer;
    margin-left: auto;
    opacity: 0;
    gap: 16px;
    right: 16px;
    border-radius: 4px;
    padding: 4px 8px ;
    position: absolute;
    background: var(--widget-background-color);
    .icon:hover {
      scale: 1.2;
    }
  }
}
</style>
