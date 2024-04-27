import { describe, expect, it } from 'vitest'

import { mount } from '@vue/test-utils'
import BaseView from '../BaseView.vue'

describe('helloWorld', () => {
  it('renders properly', () => {
    const wrapper = mount(BaseView, { props: { msg: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
})
