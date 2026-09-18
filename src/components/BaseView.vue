<script lang="ts" setup>
import { BrowserWindowApi } from '@widget-js/core'
import { Close, Left } from '@icon-park/vue-next'
import { useRouter } from 'vue-router'
import { AppUtils } from '@/utils/AppUtils'
import { Button } from '@/components/ui/button'

defineProps({
  title: String,
  leftShow: {
    type: Boolean,
    default: true,
  },
})

const router = useRouter()
function goBack() {
  AppUtils.back(router)
}

function mouseDown() {
  BrowserWindowApi.startDraggingWindow()
}

function mouseUp() {
  BrowserWindowApi.stopDraggingWindow()
}

function close() {
  window.close()
}
</script>

<template>
  <div class="base-view flex flex-col w-full">
    <div class="navbar flex items-center justify-between h-14 px-3 widget-drag-region select-none" @mousedown="mouseDown" @mouseup="mouseUp">
      <div class="flex items-center widget-no-drag-region">
        <Button v-if="leftShow" variant="ghost" size="icon" class="w-9 h-9" @click="goBack">
          <Left size="20" />
        </Button>
      </div>
      <div class="flex-1 text-center font-semibold text-lg truncate px-2">
        {{ title }}
      </div>
      <div class="flex gap-1 widget-no-drag-region">
        <slot name="actions" />
        <Button v-electron variant="ghost" size="icon" class="w-9 h-9" @click="close">
          <Close size="20" />
        </Button>
      </div>
    </div>
    <div class="flex-1 overflow-hidden">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.base-view{
  width: 100vw;
  height: 100vh;
  background-color: var(--background-color);
  border-radius: 8px;
  overflow: hidden;
  box-sizing: border-box;
}
.navbar {
  border-bottom: 1px solid var(--border);
  background: var(--background);
}
</style>
