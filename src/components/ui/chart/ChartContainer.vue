<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties, Component, PropType } from 'vue'
import { cn } from '@/lib/utils'

export interface ChartConfig {
  [key: string]: {
    label: string
    icon?: Component
    color?: string
    colorTheme?: string | string[]
  }
}

const props = defineProps({
  config: {
    type: Object as PropType<ChartConfig>,
    required: true,
  },
  className: {
    type: String,
    default: '',
  },
  asChild: {
    type: Boolean,
    default: false,
  },
})

const cssVars = computed<CSSProperties>(() => {
  const vars: Record<string, string> = {}
  Object.entries(props.config).forEach(([key, value]) => {
    if (value.color) {
      vars[`--color-${key}`] = value.color
    }
    if (value.colorTheme) {
      if (Array.isArray(value.colorTheme)) {
        value.colorTheme.forEach((c, i) => {
          vars[`--color-${key}-${i}`] = c
        })
      }
      else {
        vars[`--color-${key}`] = value.colorTheme
      }
    }
  })
  return vars as CSSProperties
})
</script>

<template>
  <div
    class="chart-wrapper w-full h-full flex-1 text-xs"
    :class="cn('aspect-video justify-center text-xs', className)"
    :style="cssVars"
  >
    <slot />
  </div>
</template>

<style scoped>
.chart-wrapper :deep(.chart-tooltip) {
  --vis-tooltip-background-color: var(--popover);
  --vis-tooltip-text-color: var(--popover-foreground);
  --vis-tooltip-border-color: var(--border);
  --vis-tooltip-border-radius: var(--radius);
  --vis-tooltip-box-shadow: 0 4px 12px rgb(0 0 0 / 20%);
}
</style>
