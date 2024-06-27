<script lang="ts" setup>
import { BrowserWindowApi } from '@widget-js/core'
import { Close } from '@icon-park/vue-next'
import { useRouter } from 'vue-router'
import { AppUtils } from '@/utils/AppUtils'

const props = defineProps({
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
    <div class="div" @mousedown="mouseDown" @mouseup="mouseUp">
      <nut-navbar fixed v-bind="props" @click-back="goBack">
        <template #right>
          <div class="flex gap-2">
            <slot name="actions" />
            <nut-button plain size="small" @click="close">
              <Close />
            </nut-button>
          </div>
        </template>
      </nut-navbar>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.base-view{
  width: 100vw;
  height: 100vh;
  background-color: rgb(241 245 249);
  border-radius: 8px;
  overflow: hidden;
  box-sizing: border-box;
}
</style>
