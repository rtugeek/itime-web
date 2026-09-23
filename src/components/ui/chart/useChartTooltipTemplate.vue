<script setup lang="ts">
import { type PropType, computed } from 'vue'
import type { VisTooltipItem } from '@unovis/ts'
import type { ChartConfig } from './ChartContainer.vue'

const props = defineProps({
  config: {
    type: Object as PropType<ChartConfig>,
    default: () => ({}),
  },
  nameKey: {
    type: String,
    default: 'name',
  },
  labelKey: {
    type: String,
    default: 'label',
  },
  hideLabel: {
    type: Boolean,
    default: false,
  },
  formatter: {
    type: Function as PropType<(value: any) => string>,
    default: undefined,
  },
})

defineEmits<{
  (e: 'rendered', html: string): void
}>()

const tooltipContent = computed(() => {
  return (d: VisTooltipItem[]) => {
    if (!d || !d.length) {
      return ''
    }
    const items = d.map((i) => {
      return {
        [props.nameKey]: i.key ?? i.name ?? '',
        [props.labelKey]: i.label ?? '',
        value: i.value,
        color: i.color,
      }
    })
    const first = items[0]
    const labelHtml = props.hideLabel
      ? ''
      : `<div class="grid items-start gap-1.5"><span class="font-medium text-muted-foreground">${props.config?.[first?.[props.nameKey]]?.label || first?.[props.labelKey] || first?.[props.nameKey] || ''}</span></div>`
    const formattedValue = props.formatter ? props.formatter(first?.value) : first?.value
    const valueHtml = first?.value !== undefined
      ? `<span class="font-mono font-medium tabular-nums text-foreground">${formattedValue}</span>`
      : ''
    const indicatorHtml = first?.color
      ? `<div class="shrink-0 mt-0.5 size-2.5 rounded-[2px]" style="--color-bg: ${first.color}; background: ${first.color};"></div>`
      : ''
    return `<div class="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-[hsl(var(--border))] border-opacity-50 bg-[hsl(var(--card))] px-2.5 py-1.5 text-xs shadow-xl z-50">
      <div class="flex w-full flex-wrap items-stretch gap-2">
        ${indicatorHtml}
        <div class="flex flex-1 items-center justify-between gap-2 leading-none">
          ${labelHtml}
          ${valueHtml}
        </div>
      </div>
    </div>`
  }
})
</script>

<template>
  <slot :tooltip-content="tooltipContent" />
</template>
