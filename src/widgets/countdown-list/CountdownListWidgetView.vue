<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useMenuListener, useWidget } from '@widget-js/vue3'
import { AddOne, SortAmountDown } from '@icon-park/vue-next'
import { useWindowSize } from '@vueuse/core'
import { DefaultWidgetTheme, MenuApiEvent } from '@widget-js/core'
import { WindowUtils } from '@/utils/WindowUtils'
import CountdownItem from '@/widgets/countdown-list/CountdownListWidgetItem.vue'
import { useCountdownEventStore } from '@/stores/useCountdownEventStore'
import { CountdownSync } from '@/data/sync/CountdownSync'
import { useSupabaseSync } from '@/common/composition/useSupabaseSync'

const countdownStore = useCountdownEventStore()
const theme = DefaultWidgetTheme.copy({
  useGlobalTheme: false,
  backgroundColor: 'rgba(255,255,255,0.3)',
})
useWidget({ defaultTheme: theme })
const { events } = storeToRefs(countdownStore)
function add() {
  WindowUtils.open('/countdown/add')
}

const { height } = useWindowSize()
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

const countdownSync = new CountdownSync()
useSupabaseSync(countdownSync)
</script>

<template>
  <WidgetWrapper>
    <div
      class="root"
    >
      <div class="title">
        <div v-t="'countdown.list'" />
        <div class="actions flex gap-2 ml-auto">
          <AddOne size="22" class="add cursor-pointer" @click="add" />
          <SortAmountDown size="22" class="add cursor-pointer" @click="countdownStore.toggleSort" />
        </div>
      </div>
      <el-scrollbar :height="height - 72">
        <div class="event-list-wrapper">
          <template v-for="item in events" :key="`${item.updateTime}-${item.createTime}`">
            <CountdownItem :event="item" />
          </template>
        </div>
      </el-scrollbar>
    </div>
  </WidgetWrapper>
</template>

<style scoped lang="scss">
.root {
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-flow: column;

  ::-webkit-scrollbar {
    height: 0;
    width: 0;
    color: transparent;
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

  .event-list-wrapper{
    display: flex;
    flex-flow: column;
    gap: 0.6rem;
    padding: 1rem;
  }

}
</style>
