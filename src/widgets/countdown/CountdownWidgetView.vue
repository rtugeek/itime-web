<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import '@/common/dayjs-extend'
import { Lunar } from 'lunar-typescript'
import { WidgetWrapper, useAppBroadcast, useMenuListener, useWidget } from '@widget-js/vue3'
import { SystemApi } from '@widget-js/core'
import { BrowserWindowApi, DefaultWidgetTheme, MenuApi, type WidgetMenuItem } from '@widget-js/core'
import { useStorage } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import type { CountdownEvent } from '@/data/CountdownEvent'
import { useCountdownEventStore } from '@/stores/useCountdownEventStore'
import { Button } from '@/components/ui/button'

const {
  widgetParams,
  widgetTheme,
} = useWidget({
  immediate: false,
  defaultTheme: DefaultWidgetTheme.copy({
    useGlobalTheme: false,
    fontSize: '14px',
    primaryColor: 'rgb(0,149,255)',
    backgroundColor: 'white',
    borderRadius: '8px',
  }),
})
const { t } = useI18n()
const event = ref<CountdownEvent | null>(null)
const countdownEventStore = useCountdownEventStore()
const countdownEventId = useStorage<string>(`countdownEventId-${widgetParams.id}`, '')
watch([() => countdownEventStore.events, countdownEventId], ([events, id]) => {
  const selected = id
    ? events.find(it => it.id === id)
    : events[0]
  event.value = selected ?? null
  if (selected) { countdownEventId.value = String(selected.id) }
}, { immediate: true })
function onSetCountdownClick() {
  const menus = countdownEventStore.events.map((it) => {
    const menu: WidgetMenuItem = {
      id: String(it.id),
      label: `${it.name}`,
      type: 'radio',
      checked: countdownEventId.value === (String(it.id)),
    }
    return menu
  })
  MenuApi.showMenu({
    menuItems: [
      {
        id: 'new-countdown',
        label: t('countdown.add'),
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
    countdownEventId.value = menu.id
  }
})

const today = ref(Date.now())
const days = computed(() => {
  if (!event.value) { return 0 }
  const now = dayjs(today.value)
  return Math.ceil(dayjs(event.value.dateTime).diff(now, 'day', true))
})
useAppBroadcast([SystemApi.EVENT_DATE_CHANGED], () => {
  today.value = Date.now()
})

const dateStr = computed(() => {
  if (!event.value) { return '' }
  const targetDate = dayjs(event.value.dateTime)
  if (event.value.dateType === 1) {
    const lunar = Lunar.fromDate(targetDate.toDate())
    return lunar.toString()
  }
  return targetDate.format('YYYY/MM/DD')
})

const titleGradientStyle = computed(() => {
  const primary = widgetTheme.value.primaryColor || 'rgb(0,149,255)'
  const endColor = `color-mix(in srgb, ${primary} 100%, #000 20%)`
  return {
    background: `linear-gradient(180deg, ${primary} 0%, ${endColor} 100%)`,
  }
})
</script>

<template>
  <WidgetWrapper>
    <div v-if="event" class="countdown-widget">
      <div class="title" :style="titleGradientStyle">
        <span class="cursor-pointer" @click="onSetCountdownClick">{{ event.name }}{{ days < 0 ? '已经' : '还有' }}</span>
      </div>
      <div class="stack">
        <div class="card" />
        <div class="card" />
        <div class="info">
          <span class="days cursor-pointer" @click="onSetCountdownClick">{{ Math.abs(days) }}</span>
          <span class="date">{{ dateStr }}</span>
        </div>
      </div>
    </div>
    <div v-else class="flex h-full items-center justify-center">
      <Button @click="onSetCountdownClick">
        {{ t('countdown.set') }}
      </Button>
    </div>
  </WidgetWrapper>
</template>

<style lang="scss">
.countdown-widget {
  border-radius: var(--widget-border-radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  overflow: hidden;
  background-color: var(--widget-background-color);

  .title {
    flex-shrink: 0;
    width: 100%;
    padding: 10px 0;
    font-size: 16px;
    color: white;
    font-weight: bold;
    z-index: 2;
    text-align: center;
  }

  .stack {
    width: 100%;
    flex-grow: 1;
    min-height: 0;
    position: relative;

    .card {
      color: white;
      width: 100%;
      position: absolute;
      height: 100%;
      background-color: white;

      &:nth-child(2) {
        z-index: 0;
        top: -5px;
        box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
        background-image: linear-gradient(rgba(174, 171, 171, 0.3) 1px, transparent 0),
        linear-gradient(90deg, rgba(174, 171, 171, 0.3) 1px, transparent 0),
        linear-gradient(white 1px, transparent 0),
        linear-gradient(90deg, white 1px, transparent 0);
        background-size: 8px 8px
      }

    }

    .info {
      position: absolute;
      inset: 0;
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      padding: 0 8px 8px;

      .days {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 0;
        font-size: 72px;
        line-height: 1;
        color: #222222;
        font-weight: bold;
      }

      .date {
        width: 100%;
        color: #5d626c;
        font-size: 14px;
        text-align: center;
      }
    }
  }
}
</style>
