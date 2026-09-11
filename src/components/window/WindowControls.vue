<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { BrowserWindowApi } from '@widget-js/core'
import { Minus, Square, X } from '@lucide/vue'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  minimize?: boolean
  maximize?: boolean
  close?: boolean
  floating?: boolean
  class?: HTMLAttributes['class']
}>(), {
  minimize: true,
  maximize: true,
  close: true,
  floating: true,
})

async function toggleMaximize() {
  if (isMaximized.value) {
    await BrowserWindowApi.unmaximize()
  }
  else {
    await BrowserWindowApi.maximize()
  }
}
</script>

<template>
  <div
    data-slot="window-controls"
    :class="cn('flex shrink-0 items-center gap-2', floating && 'fixed top-4 right-4 z-50', props.class)"
    style="-webkit-app-region: no-drag; app-region: no-drag;"
  >
    <button v-if="minimize" type="button" class="control minimize" title="Minimize" aria-label="Minimize" style="-webkit-app-region: no-drag; app-region: no-drag;" @click="BrowserWindowApi.minimize()">
      <span style="-webkit-app-region: no-drag; app-region: no-drag; pointer-events: none;">
        <Minus :size="12" aria-hidden="true" />
      </span>
    </button>
    <button v-if="maximize" type="button" class="control maximize" title="Maximize / Restore" aria-label="Maximize / Restore" style="-webkit-app-region: no-drag; app-region: no-drag;" @click="toggleMaximize">
      <span style="-webkit-app-region: no-drag; app-region: no-drag; pointer-events: none;">
        <Square :size="10" aria-hidden="true" />
      </span>
    </button>
    <button v-if="close" type="button" class="control close" title="Close" aria-label="Close" style="-webkit-app-region: no-drag; app-region: no-drag;" @click="BrowserWindowApi.close()">
      <span style="-webkit-app-region: no-drag; app-region: no-drag; pointer-events: none;">
        <X :size="12" aria-hidden="true" />
      </span>
    </button>
  </div>
</template>

<style scoped>
.control {
  appearance: none;
  -webkit-app-region: no-drag;
  app-region: no-drag;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  margin: 0;
  border-radius: 50%;
  border: none;
  color: white;
  transition: background-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 5%);
  line-height: 1;
}

.control:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 3px;
}

.minimize { background-color: #eab308; }
.minimize:hover:not(:disabled) {
  background-color: #ca8a04;
  box-shadow: 0 0 8px rgb(234 179 8 / 60%);
}
.minimize:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

.maximize { background-color: #22c55e; }
.maximize:hover:not(:disabled) {
  background-color: #16a34a;
  box-shadow: 0 0 8px rgb(34 197 94 / 60%);
}
.maximize:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

.close { background-color: #ed4f4a; }
.close:hover {
  background-color: #dc2626;
  box-shadow: 0 0 8px rgb(239 68 68 / 60%);
}
</style>
