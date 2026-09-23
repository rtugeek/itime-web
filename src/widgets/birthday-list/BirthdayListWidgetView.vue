<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import { useContextMenu, useMenuListener, useWidget } from '@widget-js/vue3'
import { Plus } from '@lucide/vue'
import { useWindowSize } from '@vueuse/core'
import { MenuApiEvent, type WidgetMenuItem } from '@widget-js/core'
import { useI18n } from 'vue-i18n'
import { WindowUtils } from '@/utils/WindowUtils'
import { useBirthdayStore } from '@/stores/useBirthdayStore'
import BirthdayItem from '@/widgets/birthday-list/BirthdayItem.vue'
import { delay } from '@/utils/TimeUtils'

const birthdayStore = useBirthdayStore()
useWidget()
const { t } = useI18n()
const { birthdayList } = storeToRefs(birthdayStore)
const listRef = ref<HTMLElement>()
function add() {
  WindowUtils.open('/birthday/add')
}

const { height } = useWindowSize()

useSortable(listRef, birthdayStore.birthdayList, {
  animation: 150,
  onEnd: async () => {
    await delay(300)
    await birthdayStore.saveAll(birthdayStore.birthdayList)
  },
})

useMenuListener((eventType, menu) => {
  if (eventType == MenuApiEvent.ITEM_CLICK) {
    const menuId = menu.id
    if (menuId.startsWith('edit-')) {
      const id = menuId.replace('edit-', '')
      WindowUtils.open(`/birthday/add?id=${id}`)
    }
    else if (menuId.startsWith('delete-')) {
      const id = menuId.replace('delete-', '')
      birthdayStore.removeById(id)
    }
  }
})

useContextMenu({ menus: [{ label: t('appSettings'), id: 'app-settings' }], onMenuClick: (menu: WidgetMenuItem) => {
  if (menu.id == 'app-settings') {
    WindowUtils.open('/settings')
  }
} })
</script>

<template>
  <WidgetWrapper shadow-color="#fb604b">
    <div
      class="birthday-list-container"
    >
      <img class="image" src="./images/balloon.png">
      <div class="title">
        <span v-t="'birthday.list'" />
        <Plus class="add cursor-pointer" @click="add" />
      </div>
      <div
        class="scroll-wrapper"
        :style="{ height: `${height - 110}px` }"
      >
        <div ref="listRef" class="people-list" style="flex:1; display:flex; flex-flow:column; overflow: auto;">
          <div
            v-for="item in birthdayList"
            :key="`${item.updateTime}-${item.createTime}`"
            class="draggable"
          >
            <BirthdayItem :birthday="item" />
          </div>
        </div>
      </div>
    </div>
  </WidgetWrapper>
</template>

<style scoped lang="scss">
.birthday-list-container {
  box-sizing: border-box;
  padding: 16px;
  overflow: hidden;
  position: relative;
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

  .people-list {
    gap: 0.6rem;
    padding: 0.4rem 0;
  }

  .draggable {
    -webkit-user-drag: element;
  }

  .image {
    position: absolute;
    right: 15px;
    height: 71px;
    top: 4px;
  }

  .title {
    display: flex;
    justify-content: flex-start;
    color: white;
    font-size: 20px;
    font-weight: bold;
    align-items: center;
    margin-bottom: 16px;
    gap: 8px;

    .add {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
    }
  }

  .list + .list {
    margin-top: 12px;
  }
}
</style>
