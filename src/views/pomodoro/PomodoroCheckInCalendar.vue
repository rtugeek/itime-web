<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import type { PomodoroHistory } from '@/data/PomodoroHistory'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { buildCheckInMonth } from '@/views/pomodoro/checkInCalendar'

const props = defineProps<{ histories: PomodoroHistory[] }>()
const month = ref(dayjs().startOf('month'))
const calendar = computed(() => buildCheckInMonth(month.value, props.histories))
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

function changeMonth(offset: number) {
  month.value = month.value.add(offset, 'month')
}
</script>

<template>
  <section aria-labelledby="check-in-calendar-title">
    <Card class="shadow-none">
      <CardHeader>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <h2 id="check-in-calendar-title" class="text-base font-semibold !text-foreground">
              打卡日历
            </h2>
            <p class="text-sm text-muted-foreground" aria-live="polite">
              本月打卡 <span class="font-medium text-foreground tabular-nums">{{ calendar.count }}</span> 天
            </p>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="上个月" @click="changeMonth(-1)">
              <ChevronLeft class="size-4" aria-hidden="true" />
            </Button>
            <span class="min-w-24 text-center text-sm font-medium tabular-nums" aria-live="polite">{{ month.format('YYYY年MM月') }}</span>
            <Button variant="outline" size="icon" aria-label="下个月" @click="changeMonth(1)">
              <ChevronRight class="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <table class="w-full table-fixed border-collapse text-center text-sm" :aria-label="`${month.format('YYYY年MM月')}打卡日历`">
          <thead class="bg-muted text-muted-foreground">
            <tr>
              <th v-for="day in weekDays" :key="day" scope="col" class="h-9 font-normal first:rounded-l-md last:rounded-r-md">
                {{ day }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(week, index) in calendar.weeks" :key="index">
              <td v-for="day in week" :key="day.key" class="py-1.5">
                <span
                  class="mx-auto flex size-9 items-center justify-center rounded-full tabular-nums"
                  :class="day.checked ? 'bg-primary font-medium text-primary-foreground' : day.inMonth ? 'text-foreground' : 'text-muted-foreground/50'"
                  :aria-label="`${day.key}${day.checked ? '，已打卡' : ''}`"
                  :aria-current="day.key === dayjs().format('YYYY-MM-DD') ? 'date' : undefined"
                >{{ day.number }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  </section>
</template>
