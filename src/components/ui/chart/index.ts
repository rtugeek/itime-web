import { type Component, h, render } from 'vue'
import type { ChartConfig } from './ChartContainer.vue'
import ChartTooltipContent from './ChartTooltipContent.vue'

export function componentToString(
  config: ChartConfig,
  ComponentClass: Component = ChartTooltipContent,
  extraProps: Record<string, any> = {},
): (d: any[]) => string {
  return (d: any[]) => {
    if (!d || !d.length) {
      return ''
    }
    const items = d.map((i) => {
      return {
        name: i.key ?? i.name ?? '',
        label: i.label ?? '',
        value: i.value,
        color: i.color,
      }
    })
    const container = document.createElement('div')
    const vnode = h(ComponentClass as any, {
      config,
      data: items,
      ...extraProps,
    })
    render(vnode, container)
    const html = container.innerHTML
    render(null, container)
    return html
  }
}
export { default as ChartContainer } from './ChartContainer.vue'
export { default as ChartTooltipContent } from './ChartTooltipContent.vue'

export interface ChartTooltipProps {
  className?: string
  cursor?: any
  content?: any
  default?: any
}

export type { ChartConfig }
