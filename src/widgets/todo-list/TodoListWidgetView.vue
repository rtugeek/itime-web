<script lang="ts" setup>
import { ref } from 'vue'
import { useElementSize, useStorage } from '@vueuse/core'
import { CircleChevronLeft, History, Plus } from '@lucide/vue'
import { useContextMenu, useWidget } from '@widget-js/vue3'
import { DefaultWidgetTheme, type WidgetMenuItem } from '@widget-js/core'
import { useI18n } from 'vue-i18n'
import TodoList from '@/widgets/todo-list/components/TodoList.vue'
import { WindowUtils } from '@/utils/WindowUtils'
import { useTodoReminder } from '@/common/composition/useTodoReminder'
import UserIcon from '@/widgets/todo-list/components/UserIcon.vue'

const { t } = useI18n()
type ViewType = 'default' | 'history'
const viewType = ref<ViewType>('default')
const title = useStorage('title', t('todo.title'))

const root = ref<HTMLElement>()

const { height } = useElementSize(root)

function openAddPage() {
  WindowUtils.open('/todo/add')
}
useWidget({ defaultTheme: DefaultWidgetTheme.copy() })
useTodoReminder()
useContextMenu({ menus: [{ label: t('appSettings'), id: 'app-settings' }], onMenuClick: (menu: WidgetMenuItem) => {
  if (menu.id == 'app-settings') {
    WindowUtils.open('/settings')
  }
} })
</script>

<template>
  <widget-wrapper>
    <div ref="root" class="todo-list-widget h-full">
      <div class="header">
        <div class="title">
          {{ viewType === 'history' ? t('todo.history') : title }}
        </div>
        <div class="actions flex gap-4 pr-2">
          <UserIcon />
          <CircleChevronLeft v-if="viewType !== 'default'" class="icon" @click="viewType = 'default'" />
          <History v-if="viewType !== 'history'" class="icon" @click="viewType = 'history'" />
          <Plus class="icon" @click="openAddPage" />
        </div>
      </div>
      <div class="list-body">
        <div
          class="scroll-wrapper"
          :style="{ height: `${height - 48}px` }"
        >
          <TodoList
            v-show="viewType === 'default'"
          />

          <TodoList
            v-show="viewType === 'history'"
            is-completed
          />
        </div>
      </div>
    </div>
  </widget-wrapper>
</template>

<style lang="scss">
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
        font-size: 18px;
      }
    }
  }

  .list-body {
    position: relative;
    color: var(--widget-color);
    font-size: 1.1rem;
    height: calc(100% - 48px);
    .scroll-wrapper {
      overflow-y: auto;
      overflow-x: hidden;
      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: rgba(128, 128, 128, 0.4);
        border-radius: 3px;
      }
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
    }
    .list {
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
