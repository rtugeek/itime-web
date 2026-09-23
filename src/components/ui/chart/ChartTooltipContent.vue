<script setup lang="ts">
import type { PropType } from 'vue'
import type { ChartConfig } from './ChartContainer.vue'
import { cn } from '@/lib/utils'

defineProps({
  hideLabel: {
    type: Boolean,
    default: false,
  },
  hideIndicator: {
    type: Boolean,
    default: false,
  },
  indicator: {
    type: String as PropType<'line' | 'dot' | 'dashed'>,
    default: 'dot',
  },
  nameKey: {
    type: String,
    default: 'name',
  },
  labelKey: {
    type: String,
    default: 'label',
  },
  config: {
    type: Object as PropType<ChartConfig>,
    default: () => ({}),
  },
  formatter: {
    type: Function as PropType<(value: any) => string>,
    default: undefined,
  },
})
</script>

<template>
  <div class="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-card px-2.5 py-1.5 text-xs shadow-xl">
    <template v-for="(item, idx) in ($attrs as any).data || []" :key="idx">
      <div v-if="!hideLabel || item?.value !== undefined" class="flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground">
        <div
          v-if="!hideIndicator && (config?.[item?.[nameKey]] || item?.color)"
          :class="cn('shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)', {
            'mt-0.5 size-2.5': indicator === 'dot',
            'my-0.5 w-1': indicator === 'line' || indicator === 'dashed',
          })"
          :style="{
            '--color-bg': config?.[item?.[nameKey]]?.color || item?.color,
            '--color-border': 'transparent',
            'borderStyle': indicator === 'dashed' ? 'dashed' : 'solid',
          } as any"
        />
        <div class="flex flex-1 items-center justify-between gap-2 leading-none">
          <div v-if="!hideLabel" class="grid items-start gap-1.5">
            <span class="font-medium text-muted-foreground">
              {{ config?.[item?.[nameKey]]?.label || item?.[labelKey] || item?.[nameKey] }}
            </span>
          </div>
          <span v-if="item?.value !== undefined" class="font-mono font-medium tabular-nums text-foreground">
            {{ formatter ? formatter(item.value) : item.value }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>
