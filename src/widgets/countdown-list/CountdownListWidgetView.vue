<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { nextTick, ref } from 'vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import { useMenuListener, useWidget } from '@widget-js/vue3'
import { ArrowDownWideNarrow, Plus } from '@lucide/vue'
import { useWindowSize } from '@vueuse/core'
import { DefaultWidgetTheme, MenuApiEvent } from '@widget-js/core'
import { WindowUtils } from '@/utils/WindowUtils'
import CountdownItem from '@/widgets/countdown-list/CountdownListWidgetItem.vue'
import { useCountdownEventStore } from '@/stores/useCountdownEventStore'

const countdownStore = useCountdownEventStore()
const theme = DefaultWidgetTheme.copy({
  useGlobalTheme: false,
  backgroundColor: 'rgba(255,255,255,0.3)',
})
useWidget({ defaultTheme: theme })
const { events } = storeToRefs(countdownStore)
const listRef = ref<HTMLElement>()
function add() {
  WindowUtils.open('/countdown/add')
}

const { height } = useWindowSize()

useSortable(listRef, events, {
  animation: 150,
  onEnd: async () => {
    await nextTick()
    await countdownStore.saveAll(countdownStore.events)
  },
})

useMenuListener((eventType, menu) => {
  if (eventType == MenuApiEvent.ITEM_CLICK) {
    const menuId = menu.id
    if (menuId.startsWith('edit-')) {
      const id = menuId.replace('edit-', '')
      WindowUtils.open(`/countdown/add?id=${id}`)
    }
    else if (menuId.startsWith('delete-')) {
      const id = menuId.replace('delete-', '')
      countdownStore.deleteCountdown(id)
    }
  }
})
</script>

<template>
  <WidgetWrapper>
    <div
      class="root"
    >
      <div class="title">
        <div v-t="'countdown.list'" />
        <div class="actions flex gap-3 ml-auto">
          <Plus :size="22" class="add cursor-pointer" @click="add" />
          <ArrowDownWideNarrow :size="22" class="add cursor-pointer mr-2" @click="countdownStore.toggleSort" />
        </div>
      </div>
      <div
        class="scroll-wrapper"
        :style="{ height: `${height - 72}px` }"
      >
        <div ref="listRef" class="event-list-wrapper">
          <div
            v-for="item in events"
            :key="item.id"
            class="draggable"
          >
            <CountdownItem :event="item" />
          </div>
        </div>
      </div>
    </div>
  </WidgetWrapper>
</template>

<style scoped lang="scss">
.root {
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-flow: column;

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

  .event-list-wrapper{
    display: flex;
    flex-flow: column;
    gap: 0.6rem;
    padding: 1rem;
  }

  .draggable {
    -webkit-user-drag: element;
  }

  .image {
    position: absolute;
    right: 15px;
    height: 71px;
    top: 12px;
  }

  .title {
    display: flex;
    background: var(--widget-primary-color);
    justify-content: flex-start;
    color: var(--widget-color);
    font-size: 1.2rem;
    border-top-left-radius: var(--widget-border-radius);
    border-top-right-radius: var(--widget-border-radius);
    font-weight: bold;
    padding: 0.6rem 1rem;
    align-items: center;
    gap: 8px;
    .add {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
    }
  }

}
</style>
