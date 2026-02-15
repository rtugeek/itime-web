<script lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import '@/common/dayjs-extend'
import { Lunar } from 'lunar-typescript'
import { useAppBroadcast } from '@widget-js/vue3'
import { SystemApiEvent } from '@widget-js/core'

export default {
  name: 'CountdownComponent',
  props: {
    title: { type: String },
    date: { type: String },
    isLunar: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  setup(props) {
    const days = computed(() => {
      const now = dayjs()
      return Math.ceil(dayjs(props.date).diff(now, 'day', true))
    })
    useAppBroadcast([SystemApiEvent.DATE_CHANGED], () => {
      days.effect.run()
    })

    const dateStr = computed(() => {
      const targetDate = dayjs(props.date)
      if (props.isLunar) {
        const lunar = Lunar.fromDate(targetDate.toDate())
        return lunar.toString()
      }
      return targetDate.format('YYYY/MM/DD')
    })
    return {
      days,
      dateStr,
    }
  },
}
</script>

<template>
  <div class="countdown-widget">
    <div class="title">
      <span class="cursor-pointer" @click="$emit('click')">{{ title }}{{ days < 0 ? '已经' : '还有' }}</span>
    </div>
    <div class="stack">
      <div class="card" />
      <div class="card" />
      <div class="info">
        <span class="days cursor-pointer" @click="$emit('click')">{{ Math.abs(days) }}</span>
        <span class="date">{{ dateStr }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
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
    //box-shadow: 0 1px 5px v-bind(shadowColor);
    text-align: center;
  }

  .stack {
    width: 100%;
    flex-grow: 1;
    position: relative;

    .card {
      color: white;
      //border-radius: 0 0 $border-radius $border-radius;
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
