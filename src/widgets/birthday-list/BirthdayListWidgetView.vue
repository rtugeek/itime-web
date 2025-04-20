<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useContextMenu, useMenuListener, useWidget } from '@widget-js/vue3'
import { AddOne } from '@icon-park/vue-next'
import { useWindowSize } from '@vueuse/core'
import { MenuApiEvent, type WidgetMenuItem } from '@widget-js/core'
import { useI18n } from 'vue-i18n'
import { WindowUtils } from '@/utils/WindowUtils'
import { useBirthdayStore } from '@/stores/useBirthdayStore'
import BirthdayItem from '@/widgets/birthday-list/BirthdayItem.vue'

const birthdayStore = useBirthdayStore()
useWidget()
const { t } = useI18n()
const { birthdayList } = storeToRefs(birthdayStore)
function add() {
  WindowUtils.open('/birthday/add')
}

const { height } = useWindowSize()
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
        <AddOne class="add cursor-pointer" @click="add" />
      </div>
      <el-scrollbar :height="height - 110">
        <div class="people-list" style="flex:1; display:flex; flex-flow:column; overflow: auto;">
          <template v-for="item in birthdayList" :key="`${item.updateTime}-${item.createTime}`">
            <BirthdayItem :birthday="item" />
          </template>
        </div>
      </el-scrollbar>
    </div>
  </WidgetWrapper>
</template>

<style scoped lang="scss">
.birthday-list-container {
  box-sizing: border-box;
  padding: 24px;
  overflow: hidden;
  position: relative;
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
