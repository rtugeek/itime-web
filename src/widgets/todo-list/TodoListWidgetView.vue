<script lang="ts" setup>
import { ref } from 'vue'
import { useElementSize } from '@vueuse/core'
import { AddOne, ArrowCircleLeft, History } from '@icon-park/vue-next'
import { useWidget } from '@widget-js/vue3'
import TodoList from '@/widgets/todo-list/components/TodoList.vue'
import { WindowUtils } from '@/utils/WindowUtils'
import { useTodoStore } from '@/stores/useTodoStore'

type ViewType = 'default' | 'history'
const viewType = ref<ViewType>('default')

const root = ref<HTMLElement>()

const { height } = useElementSize(root)

function openAddPage() {
  WindowUtils.open('/todo/add')
}
const todoStore = useTodoStore()
todoStore.sync()
useWidget()
</script>

<template>
  <widget-wrapper>
    <div ref="root" class="todo-list-widget h-full">
      <div class="header">
        <div class="title">
          {{ viewType === 'history' ? '历史记录' : '待办事项' }}
        </div>
        <div class="actions flex gap-4">
          <ArrowCircleLeft v-if="viewType !== 'default'" class="icon" @click="viewType = 'default'" />
          <History v-if="viewType !== 'history'" class="icon" @click="viewType = 'history'" />
          <AddOne class="icon" @click="openAddPage" />
        </div>
      </div>
      <div class="list-body">
        <el-scrollbar :height="height - 48" wrap-style="overflow-x:hidden;">
          <TodoList
            v-show="viewType === 'default'"
          />

          <TodoList
            v-show="viewType === 'history'"
            is-completed
          />
        </el-scrollbar>
      </div>
    </div>
  </widget-wrapper>
</template>

<style scoped lang="scss">
.todo-list-widget {
  font-weight: bold;

  .header {
    align-items: center;
    padding: 8px 16px;
    display: flex;
    border-bottom: solid 1px var(--widget-divider-color);

    .title {
      flex-grow: 1;
      font-size: 1.1rem;
      color: var(--widget-color);
    }

    .actions {
      .icon {
        cursor: pointer;
        color: var(--widget-color);
        font-size: 24px;
      }
    }
  }

  .list-body {
    position: relative;
    color: var(--widget-color);
    font-size: 1.1rem;
    height: calc(100% - 48px);
    .list {
      width: 100%;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s;
}

.list-enter,
.list-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
