import { DefaultWidgetTheme } from '@widget-js/core'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useWidgetTheme } from '@widget-js/vue3/dist/vue3.es.js'
import { describe, expect, it } from 'vitest'

describe('widget theme initialization', () => {
  it('can disable global theme on first load', async () => {
    localStorage.clear()
    let theme: ReturnType<typeof useWidgetTheme>['widgetTheme']
    const wrapper = mount(defineComponent({
      setup() {
        theme = useWidgetTheme({ defaultTheme: DefaultWidgetTheme.copy(), immediate: false }).widgetTheme
        return () => null
      },
    }))
    await nextTick()
    theme!.value.useGlobalTheme = false
    await nextTick()
    expect(theme!.value.useGlobalTheme).toBe(false)
    expect(document.documentElement.style.getPropertyValue('--widget-use-global-theme')).toBe('false')
    const key = Object.keys(localStorage).find(key => key.startsWith('widget-theme/'))!
    expect(JSON.parse(localStorage.getItem(key)!).useGlobalTheme).toBe(false)
    theme!.value.useGlobalTheme = true
    await nextTick()
    expect(document.documentElement.style.getPropertyValue('--widget-use-global-theme')).toBe('')
    wrapper.unmount()
  })
})
