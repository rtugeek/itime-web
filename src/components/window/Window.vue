<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import WindowTitleBar from './WindowTitleBar.vue'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  title?: string
  class?: HTMLAttributes['class']
  minimize?: boolean
  maximize?: boolean
  close?: boolean
}>(), {
  minimize: true,
  maximize: true,
  close: true,
})
</script>

<template>
  <main data-slot="window" :class="cn('h-screen overflow-hidden bg-background text-foreground', props.class)">
    <section class="mx-auto flex h-full w-full flex-col">
      <WindowTitleBar :title="title" :minimize="minimize" :maximize="maximize" :close="close" class="shrink-0">
        <template #title>
          <slot name="title">
            {{ title }}
          </slot>
        </template>
      </WindowTitleBar>
      <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div class="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <slot />
        </div>
        <div v-if="$slots.footer" class="border border-border/60 bg-muted/60 px-4 py-3 shadow-sm backdrop-blur">
          <slot name="footer" />
        </div>
      </div>
    </section>
  </main>
</template>
