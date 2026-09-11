<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import '@/common/dayjs-extend'
import { Lunar } from 'lunar-typescript'
import { WidgetWrapper, useAppBroadcast, useMenuListener, useWidget } from '@widget-js/vue3'
import { SystemApi } from '@widget-js/core'
import { BrowserWindowApi, DefaultWidgetTheme, MenuApi, type WidgetMenuItem } from '@widget-js/core'
import { useStorage } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import type { CountdownEvent } from '@/data/CountdownEvent'
import { CountdownEventRepository } from '@/data/repository/CountdownEventRepository'
import { useCountdownEventStore } from '@/stores/useCountdownEventStore'
import { Button } from '@/components/ui/button'

const {
  widgetParams,
} = useWidget({ defaultTheme: DefaultWidgetTheme.copy({
  useGlobalTheme: false,
  fontSize: '72px',
  primaryColor: 'rgb(0,149,255)',
  backgroundColor: 'white',
}) })
const { t } = useI18n()
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
    CountdownEventRepository.get(menu.id).then((res) => {
      event.value = res
      countdownEventId.value = res?.id
    })
  }
})

const days = computed(() => {
  if (!event.value) { return 0 }
  const now = dayjs()
  return Math.ceil(dayjs(event.value.dateTime).diff(now, 'day', true))
})
useAppBroadcast([SystemApi.EVENT_DATE_CHANGED], () => {
  days.effect.run()
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
</script>

<template>
  <WidgetWrapper>
    <div v-if="event" class="countdown-widget">
      <div class="title">
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
    --widget-primary-color-end: color-mix(in srgb, var(--widget-primary-color) 100%, #000 20%);
    width: 100%;
    padding: 10px 0;
    background: linear-gradient(180deg,var(--widget-primary-color) 0%, var(--widget-primary-color-end) 100%);
    font-size: 16px;
    color: white;
    font-weight: bold;
    z-index: 2;
    text-align: center;
  }

  .stack {
    width: 100%;
    flex-grow: 1;
    position: relative;

    .card {
      color: white;
      width: 100%;
      position: absolute;
      height: 100%;
      background-color: var(--widget-background-color);

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
      width: 100%;
      height: calc(100vh - 20px);
      justify-content: center;
      align-items: center;
      justify-items: center;
      display: flex;
      flex-direction: column;

      .days {
        font-size: var(--widget-font-size);
        color: #222222;
        display: flex;
        align-items: center;
        font-weight: bold;
        flex-grow: 1;
        text-align: center;
        vertical-align: center;
      }

      .date {
        color: #5d626c;
        font-size: 14px;
        margin-bottom: 0.8rem;
        text-align: center;
      }
    }
  }
}
</style>
