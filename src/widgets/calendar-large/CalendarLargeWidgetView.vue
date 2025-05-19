<script lang="ts" setup>
import { useAppLanguage, useWidget } from '@widget-js/vue3'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import { nextTick, onMounted, ref, watch } from 'vue'
import type { CalendarOptions, EventClickArg } from '@fullcalendar/core'
import rrulePlugin from '@fullcalendar/rrule'
import icalendarPlugin from '@fullcalendar/icalendar'
import interactionPlugin from '@fullcalendar/interaction'
import { storeToRefs } from 'pinia'
import { watchOnce } from '@vueuse/core'
import { WindowUtils } from '@/utils/WindowUtils'
import { useTodoStore } from '@/stores/useTodoStore'
import { useFestivalEventSource } from '@/widgets/calendar-large/useFestivalEventSource'
import { useLunarEventSource } from '@/widgets/calendar-large/useLunarEventSource'

useWidget()
const calendarRef = ref<InstanceType<typeof FullCalendar>>()
const todoStore = useTodoStore()
const { todos } = storeToRefs(todoStore)
const festivalEventSource = useFestivalEventSource()
const lunarEventSource = useLunarEventSource()
let contextMenuClickAt = Date.now()
document.addEventListener('contextmenu', () => {
  contextMenuClickAt = Date.now()
})
const calendarOptions = ref<CalendarOptions>({
  plugins: [dayGridPlugin, rrulePlugin, interactionPlugin, icalendarPlugin],
  weekNumbers: false,
  buttonText: {
    today: '今天',
  },
  eventSources: [lunarEventSource, festivalEventSource],
  initialView: 'dayGridMonth',
  eventClick: (arg: EventClickArg) => {
    const id = arg.event.id
    if (id && arg.event.extendedProps.category == 'default') {
      WindowUtils.open(`/todo/add?id=${id}`)
    }
  },
  dateClick: (info) => {
    // 判断是否是右键点击
    if (contextMenuClickAt + 200 > Date.now()) {
      return
    }
    WindowUtils.open(`/todo/add?dueDateTime=${info.date.toISOString()}`)
  },
},
)
//
watch(() => todos.value, (newVal, oldVal) => {
  const calendar = calendarRef.value?.getApi()
  // 清空事件
  if (calendar) {
    const events = calendar.getEvents()
    for (const removedEvent of events) {
      if (removedEvent.extendedProps.category == 'default') {
        calendar?.getEventById(removedEvent.id)?.remove()
      }
    }
  }
  for (const addedEvent of newVal) {
    calendar?.addEvent({
      id: addedEvent.id,
      title: addedEvent.title,
      start: addedEvent.dueDateTime,
      rrule: addedEvent.recurrence,
      extendedProps: {
        category: 'default',
      },
    })
  }
}, { deep: true, immediate: true })

onMounted(async () => {
  await nextTick()
})
useAppLanguage({
  onLoad: (code) => {
    calendarOptions.value.locale = code
  },
  onChange: (code) => {
    calendarOptions.value.locale = code
  },
})
</script>

<template>
  <widget-wrapper>
    <FullCalendar ref="calendarRef" class="calendar" :options="calendarOptions" />
  </widget-wrapper>
</template>

<style lang="scss">
:root {
  --fc-border-color: var(--widget-color);
  --fc-page-bg-color: #fff;
  --fc-event-text-color: var(--widget-color);
  --fc-neutral-text-color: #000;
  --fc-neutral-bg-color: #fff;
  --fc-list-event-hover-bg-color: #f5f5f5;
}

.fc-popover{
  border-radius: 8px;
  color: #000;
  overflow: hidden;
}

.fc-theme-standard .fc-popover-header{
  background-color: #dae0eb;
}
.calendar{
  padding: 1rem;
  color: var(--widget-color);
  height: 100%;
}

td{
  cursor: pointer;
}

h2.fc-toolbar-title{
  color: var(--widget-color);
}
</style>
