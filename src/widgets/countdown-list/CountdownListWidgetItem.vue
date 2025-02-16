<script setup lang="ts">
import { type PropType, computed } from 'vue'
import { MenuApi } from '@widget-js/core'
import type { CountdownEvent } from '@/data/CountdownEvent'

const props = defineProps({ event: { type: Object as PropType<CountdownEvent>, required: true } })
function onItemClick() {
  MenuApi.showMenu({
    menuItems: [
      {
        label: '编辑',
        id: `edit-${props.event.id}`,
      },
      {
        label: '删除',
        id: `delete-${props.event.id}`,
      },
    ],
  })
}

const isToday = computed(() => {
  return props.event.isToday()
})
</script>

<template>
  <div class="event" :class="{ today: isToday, past: event.isPast() }" @click="onItemClick">
    <div class="info">
      <div class="text-lg">
        {{ event.name }}
      </div>
      <div class="date flex items-center">
        <div class="text-sm">
          {{ event.getDateTimeText() }}
        </div>
      </div>
      <div class="note text-sm note">
        {{ event.note }}
      </div>
    </div>
    <div class="countdown">
      <div class="days">
        {{ Math.abs(event.countdown()) }}
      </div>
      <div class="unit">
        天
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.event {
  border-radius: 6px;
  display: flex;
  padding-left: 12px;
  box-shadow: 0 0 2px 0 #b7b7b7;
  cursor: pointer;
  background-color: white;
  overflow: hidden;
  z-index: 1;
  transition: all 0.5s ease;

  .info{
    padding: 6px 0;
  }
  .date, .note{
    display: none;
  }
  &:hover {
    .date, .note{
      display: block;
    }
  }
  .countdown{
    color: white;
    margin-left: auto;
    background-color: #478EFF;
    display: flex;
    align-items: center;
    vertical-align: middle;
    font-size: 1.2rem;

    .days,.unit{
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .days {
      width: 70px;
      font-weight: bold;
      text-align: center;
    }

    .unit {
      margin-left:auto;
      height: 100%;
      width: 2.5rem;
      background-color: rgba(0, 0, 0, 0.15);
    }
  }

  &.today {
    .countdown{
      background-color: #ffcd16;
    }
  }

  &.past {
    .countdown{
      background-color: #ff3916;
    }
  }

}
</style>
