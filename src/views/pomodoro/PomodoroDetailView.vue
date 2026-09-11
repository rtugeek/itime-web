<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { toast } from 'vue-sonner'
import { ArrowLeft, Edit, History, Timer } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import { PomodoroUtils } from '@/utils/PomodoroUtils'
import type { PomodoroScene } from '@/data/PomodoroScene'
import PomodoroDetailBlock from '@/views/pomodoro/PomodoroDetailBlock.vue'
import PomodoroCheckInCalendar from '@/views/pomodoro/PomodoroCheckInCalendar.vue'
import { usePomodoroStore } from '@/stores/usePomodoroStore'
import type { PomodoroHistory } from '@/data/PomodoroHistory'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'

const route = useRoute()
const router = useRouter()
const id = Number.parseInt(route.query.id as string)
const scene = ref<PomodoroScene>()
const histories = ref<PomodoroHistory[]>([])
const checkInDayCount = ref(0)
const count = ref(0)
const { t } = useI18n()
const pomodoroStore = usePomodoroStore()
pomodoroStore.findSceneById(id).then((data) => {
  if (data) {
    scene.value = data
    pomodoroStore.findHistoryBySceneId(id).then((his) => {
      histories.value = his.sort((a, b) => dayjs(b.startTime).valueOf() - dayjs(a.startTime).valueOf())
      const date = new Set<string>()
      his.forEach((history) => {
        date.add(dayjs(history.startTime).format('YYYY-MM-DD'))
      })
      checkInDayCount.value = date.size
      count.value = histories.value.length
    })
  }
  else {
    toast.warning('Scene not found')
    router.push({ name: 'Pomodoro' })
  }
})

function onEdit() {
  router.push({ name: 'PomodoroSceneAdd', query: { id } })
}

function onBack() {
  router.push({ name: 'Pomodoro' })
}

const total = computed(() => {
  return PomodoroUtils.getTotalHourStr(histories.value)
})
</script>

<template>
  <main class="min-w-0 flex-1 p-3 sm:p-4">
    <div v-if="scene" class="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex min-w-0 items-center gap-3">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted text-2xl" aria-hidden="true">
            {{ scene.icon }}
          </div>
          <h1 class="break-words text-2xl font-semibold tracking-tight !text-foreground sm:text-3xl">
            {{ scene.name }}
          </h1>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" @click="onBack">
            <ArrowLeft class="size-4" aria-hidden="true" />
            返回
          </Button>
          <Button @click="onEdit">
            <Edit class="size-4" aria-hidden="true" />
            编辑
          </Button>
        </div>
      </header>

      <section aria-label="专注统计" class="grid grid-cols-3 gap-2 sm:gap-4">
        <PomodoroDetailBlock :title="t('pomodoro.totalDuration')" :content="total" :unit="t('unit.hour', total)" />
        <PomodoroDetailBlock :title="t('pomodoro.checkInDays')" :content="checkInDayCount" :unit="t('unit.day', checkInDayCount)" />
        <PomodoroDetailBlock :title="t('pomodoro.records')" :content="count" :unit="t('unit.line', count)" />
      </section>

      <PomodoroCheckInCalendar :histories="histories" />

      <section aria-labelledby="pomodoro-history-title">
        <Card class="gap-0 overflow-hidden shadow-none">
          <CardHeader class="border-b">
            <div class="flex items-center gap-2">
              <h2 id="pomodoro-history-title" class="text-base font-semibold !text-foreground">
                {{ t('pomodoro.history.title') }}
              </h2>
              <Badge variant="secondary" class="tabular-nums">
                {{ count }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="px-0">
            <ul v-if="histories.length" class="m-0 list-none divide-y p-0">
              <li v-for="history in histories" :key="history.id">
                <Item class="gap-3 rounded-none border-0 px-6 py-4">
                  <ItemMedia variant="icon" class="bg-muted text-muted-foreground">
                    <Timer aria-hidden="true" />
                  </ItemMedia>
                  <ItemContent class="min-w-0 gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <ItemTitle class="shrink-0 text-base tabular-nums">
                      {{ Math.ceil(history.duration / 60) }} {{ t('minute') }}
                    </ItemTitle>
                    <time :datetime="dayjs(history.startTime).toISOString()" class="text-sm text-muted-foreground tabular-nums">
                      {{ dayjs(history.startTime).format('YYYY-MM-DD HH:mm') }}
                    </time>
                  </ItemContent>
                </Item>
              </li>
            </ul>
            <Empty v-else>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <History aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>暂无专注记录</EmptyTitle>
                <EmptyDescription>完成一次专注后，即可在这里查看记录。</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      </section>
    </div>
  </main>
</template>
