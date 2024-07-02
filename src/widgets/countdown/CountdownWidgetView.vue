<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue'
import {
  WidgetWrapper,
  useMenuListener,
  useWidget,
} from '@widget-js/vue3'
import { BrowserWindowApi, DefaultWidgetTheme, MenuApi, type WidgetMenuItem } from '@widget-js/core'
import { useStorage } from '@vueuse/core'
import CountdownComponent from '@/widgets/countdown/CountdownComponent.vue'
import type { CountdownEvent } from '@/data/CountdownEvent'
import { CountdownEventRepository } from '@/data/repository/CountdownEventRepository'
import { useCountdownEventStore } from '@/stores/useCountdownEventStore'

const {
  widgetParams,
} = useWidget({ defaultTheme: DefaultWidgetTheme.copy({
  useGlobalTheme: false,
  fontSize: '72px',
  primaryColor: 'rgb(0,149,255)',
  backgroundColor: 'white',
}) })
const event = ref<CountdownEvent | null>(null)
const countdownEventStore = useCountdownEventStore()
const countdownEventId = useStorage<string>(`countdownEventId-${widgetParams.id}`, '')
onMounted(async () => {
  await nextTick()
  if (countdownEventId.value) {
    event.value = await CountdownEventRepository.get(countdownEventId.value)
  }
  else {
    if (countdownEventId.value == '') {
      const events = await CountdownEventRepository.all()
      if (events.length > 0) {
        countdownEventId.value = events[0].id
        event.value = events[0]
      }
    }
  }
})

function onSetCountdownClick() {
  const menus = countdownEventStore.events.map((it) => {
    const menu: WidgetMenuItem = {
      id: it.id!,
      label: `${it.name}`,
      type: 'radio',
      checked: countdownEventId.value == it.id,
    }
    return menu
  })
  MenuApi.showMenu({
    menuItems: [
      {
        id: 'new-countdown',
        label: '新建倒计时',
      },
      ...menus,
    ],
  })
}

useMenuListener((type, menu) => {
  if (menu.id == 'new-countdown') {
    BrowserWindowApi.openUrl('/countdown/add?width=400&height=700&frame=true&transparent=false')
  }
  else {
    CountdownEventRepository.get(menu.id).then((res) => {
      event.value = res
      countdownEventId.value = res?.id
    })
  }
})
</script>

<template>
  <WidgetWrapper>
    <CountdownComponent
      v-if="event"
      :date="event.dateTime"
      :title="event.name"
      :is-lunar="event.dateType === 1"
      @header-click="onSetCountdownClick"
    />
    <div v-else class="flex items-center justify-center">
      <nut-button @click="onSetCountdownClick">
        设置倒计时
      </nut-button>
    </div>
  </WidgetWrapper>
</template>

<style scoped>

</style>
