<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import WindowControls from './WindowControls.vue'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  title?: string
  class?: HTMLAttributes['class']
  minimize?: boolean
  maximize?: boolean
  close?: boolean
  floating?: boolean
}>(), {
  minimize: true,
  maximize: true,
  close: true,
  floating: false,
})
</script>

<template>
  <div
    data-slot="window-title-bar"
    :class="cn('window-title-bar sticky top-0 z-100 flex w-full items-center justify-between gap-3 border-b border-border bg-background/82 px-4 py-3 backdrop-blur-md', props.class)"
  >
    <div class="min-w-0 flex-1 text-lg font-bold">
      <slot name="title">
        {{ title }}
      </slot>
    </div>
    <WindowControls :minimize="minimize" :maximize="maximize" :close="close" :floating="floating" />
  </div>
</template>

<style scoped>
.window-title-bar {
  -webkit-app-region: drag;
  app-region: drag;
}
</style>
