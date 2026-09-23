<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { toast } from 'vue-sonner'
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Edit, History, Loader2, Timer, Trash2 } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import consola from 'consola'
import { VisAxis, VisGroupedBar, VisTooltip, VisXYContainer } from '@unovis/vue'
import { GroupedBar } from '@unovis/ts'
import { PomodoroUtils } from '@/utils/PomodoroUtils'
import type { IPomodoroScene } from '@/data/PomodoroScene'
import PomodoroDetailBlock from '@/views/pomodoro/PomodoroDetailBlock.vue'
import { usePomodoroStore } from '@/stores/usePomodoroStore'
import type { PomodoroHistory } from '@/data/PomodoroHistory'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'

const route = useRoute()
const router = useRouter()
const id = route.query.id as string
const scene = ref<IPomodoroScene>()
const histories = ref<PomodoroHistory[]>([])
const checkInDayCount = ref(0)
const count = ref(0)
const showDeleteDialog = ref(false)
const isDeleting = ref(false)
const showDeleteHistoryDialog = ref(false)
const isDeletingHistory = ref(false)
const pendingDeleteHistory = ref<PomodoroHistory | null>(null)
const PAGE_SIZE = 20
const currentPage = ref(1)
let reloadPromise: Promise<void> | undefined
const { t } = useI18n()
const pomodoroStore = usePomodoroStore()
function reload() {
  if (reloadPromise) { return reloadPromise }
  reloadPromise = (async () => {
    try {
      const data = await pomodoroStore.findSceneById(id)
      if (!data) {
        consola.warn('Scene not found', id)
        toast.warning('Scene not found')
        router.push({ name: 'Pomodoro' })
        return
      }
      const his = await pomodoroStore.findHistoryBySceneId(data.id!)
      const sorted = his.sort((a, b) => dayjs(b.startTime).valueOf() - dayjs(a.startTime).valueOf())
      const date = new Set<string>()
      his.forEach((history) => {
        date.add(dayjs(history.startTime).format('YYYY-MM-DD'))
      })
      scene.value = data
      histories.value = sorted
      checkInDayCount.value = date.size
      count.value = sorted.length
      const maxPage = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
      if (currentPage.value > maxPage) {
        currentPage.value = maxPage
      }
    }
    finally {
      reloadPromise = undefined
    }
  })()
  return reloadPromise
}
watch(() => pomodoroStore.dataRevision, reload, { immediate: true })

function onEdit() {
  router.push({ name: 'PomodoroSceneAdd', query: { id } })
}

function onDelete() {
  showDeleteDialog.value = true
}

async function confirmDelete() {
  if (isDeleting.value) { return }
  isDeleting.value = true
  try {
    await pomodoroStore.deleteScene(id)
    toast.success('已删除番茄场景')
    router.push({ name: 'Pomodoro' })
  }
  finally {
    isDeleting.value = false
  }
}

function onDeleteHistory(history: PomodoroHistory) {
  pendingDeleteHistory.value = history
  showDeleteHistoryDialog.value = true
}

async function confirmDeleteHistory() {
  if (!pendingDeleteHistory.value || isDeletingHistory.value) { return }
  isDeletingHistory.value = true
  const loadingId = toast.loading('删除中...')
  try {
    await pomodoroStore.deleteHistory(pendingDeleteHistory.value)
    await reloadPromise
    await reload()
    showDeleteHistoryDialog.value = false
    pendingDeleteHistory.value = null
    toast.success('已删除专注记录')
  }
  catch (error) {
    consola.error('Failed to delete pomodoro history', error)
    toast.error('删除失败，请重试')
  }
  finally {
    toast.dismiss(loadingId)
    isDeletingHistory.value = false
  }
}

function cancelDeleteHistory() {
  showDeleteHistoryDialog.value = false
  pendingDeleteHistory.value = null
}

function onBack() {
  router.push({ name: 'Pomodoro' })
}

const total = computed(() => {
  return PomodoroUtils.getTotalHourStr(histories.value)
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(histories.value.length / PAGE_SIZE))
})

const pagedHistories = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE
  return histories.value.slice(start, end)
})

const hasPrevPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => currentPage.value < totalPages.value)

function goToPrevPage() {
  if (hasPrevPage.value) {
    currentPage.value--
  }
}

function goToNextPage() {
  if (hasNextPage.value) {
    currentPage.value++
  }
}

const selectedMonth = ref(dayjs().startOf('month'))

function goToPrevMonth() {
  selectedMonth.value = selectedMonth.value.subtract(1, 'month')
}

function goToNextMonth() {
  const next = selectedMonth.value.add(1, 'month')
  if (next.isAfter(dayjs().startOf('month'))) {
    return
  }
  selectedMonth.value = next
}

function isCurrentMonth() {
  return selectedMonth.value.isSame(dayjs().startOf('month'), 'month')
}

interface MonthlyFocusData {
  date: Date
  dateStr: string
  label: string
  durationSec: number
  durationMinutes: number
}

const monthlyData = computed<MonthlyFocusData[]>(() => {
  const result: MonthlyFocusData[] = []
  const start = selectedMonth.value.startOf('month')
  const end = selectedMonth.value.endOf('month')
  const today = dayjs()
  let cursor = start
  while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
    const dateStr = cursor.format('YYYY-MM-DD')
    result.push({
      date: cursor.toDate(),
      dateStr,
      label: cursor.format('DD'),
      durationSec: 0,
      durationMinutes: 0,
    })
    cursor = cursor.add(1, 'day')
    if (cursor.isAfter(today.endOf('day')) && selectedMonth.value.isSame(today.startOf('month'), 'month')) {
      break
    }
  }
  const dateMap = new Map<string, MonthlyFocusData>()
  result.forEach((item) => {
    dateMap.set(item.dateStr, item)
  })
  const monthStart = selectedMonth.value.valueOf()
  const monthEnd = selectedMonth.value.endOf('month').valueOf()
  histories.value.forEach((history) => {
    const ts = dayjs(history.startTime).valueOf()
    if (ts < monthStart || ts > monthEnd) {
      return
    }
    const historyDate = dayjs(history.startTime).format('YYYY-MM-DD')
    const item = dateMap.get(historyDate)
    if (item) {
      item.durationSec += history.duration
    }
  })
  result.forEach((item) => {
    item.durationMinutes = Math.ceil(item.durationSec / 60)
  })
  return result
})

const chartData = computed(() => {
  return monthlyData.value.map(d => ({
    date: d.date.getTime(),
    focus: d.durationMinutes,
  }))
})

const chartTickValues = computed(() => {
  return monthlyData.value
    .filter((_, i) => i === 0 || (i + 1) % 5 === 0 || i === monthlyData.value.length - 1)
    .map(d => d.date.getTime())
})

interface ChartDatum { date: number, focus: number }

const chartConfig = {
  focus: {
    label: '专注时长',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

const monthlyTotalMinutes = computed(() => {
  return monthlyData.value.reduce((acc, cur) => acc + cur.durationMinutes, 0)
})

const monthlyTotalText = computed(() => {
  const minutes = monthlyTotalMinutes.value
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h} 小时 ${m} 分钟` : `${h} 小时`
  }
  return `${minutes} 分钟`
})

const monthlyActiveDays = computed(() => {
  return monthlyData.value.filter(d => d.durationMinutes > 0).length
})

const monthlyMaxMinutes = computed(() => {
  const max = Math.max(...monthlyData.value.map(d => d.durationMinutes))
  return max > 0 ? max : 1
})

function formatDurationTooltip(value: number) {
  if (value >= 60) {
    const h = Math.floor(value / 60)
    const m = value % 60
    return m > 0 ? `${h} 小时 ${m} 分钟` : `${h} 小时`
  }
  return `${value} 分钟`
}

function renderBarTooltip(d: ChartDatum) {
  const content = document.createElement('div')
  content.className = 'grid gap-1 text-xs text-popover-foreground'
  const date = document.createElement('div')
  date.className = 'text-muted-foreground'
  date.textContent = dayjs(d.date).format('YYYY-MM-DD')
  const duration = document.createElement('div')
  duration.className = 'font-medium tabular-nums'
  duration.textContent = `专注时长：${formatDurationTooltip(d.focus)}`
  content.append(date, duration)
  return content
}

const barTooltipTriggers = { [GroupedBar.selectors.bar]: renderBarTooltip }
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
          <Button variant="destructive" :disabled="isDeleting" @click="onDelete">
            <Loader2 v-if="isDeleting" class="size-4 animate-spin" aria-hidden="true" />
            <Trash2 v-else class="size-4" aria-hidden="true" />
            删除
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

      <section aria-label="每月专注时长">
        <Card class="overflow-hidden shadow-none">
          <CardHeader class="border-b flex flex-row items-center justify-between gap-3 flex-wrap">
            <div class="flex items-center gap-2">
              <div class="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted text-foreground/80" aria-hidden="true">
                <CalendarDays class="size-4" />
              </div>
              <div class="flex flex-col gap-0.5">
                <CardTitle class="text-base font-semibold !text-foreground leading-tight">
                  {{ selectedMonth.format('YYYY 年 M 月') }}
                </CardTitle>
                <CardDescription class="!mt-0 text-xs">
                  专注 {{ monthlyTotalText }} · {{ monthlyActiveDays }} 天打卡
                </CardDescription>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                class="size-8"
                @click="goToPrevMonth"
              >
                <ChevronLeft class="size-4" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                class="size-8"
                :disabled="isCurrentMonth()"
                @click="goToNextMonth"
              >
                <ChevronRight class="size-4" aria-hidden="true" />
              </Button>
            </div>
          </CardHeader>
          <CardContent class="pt-6">
            <ChartContainer :config="chartConfig" class="aspect-[5/2] w-full">
              <VisXYContainer
                :data="chartData"
                :margin="{ left: 8, right: 8, top: 8, bottom: 28 }"
                :y-domain="[0, undefined]"
              >
                <VisGroupedBar
                  :x="(d: ChartDatum) => d.date"
                  :y="(d: ChartDatum) => d.focus"
                  :color="chartConfig.focus.color"
                  :rounded-corners="8"
                  :group-padding="0.4"
                />
                <VisAxis
                  type="x"
                  :x="(d: ChartDatum) => d.date"
                  :tick-line="false"
                  :domain-line="false"
                  :grid-line="false"
                  :num-ticks="Math.max(4, Math.ceil(chartData.length / 5))"
                  :tick-format="(d: number) => dayjs(d).format('DD')"
                  :tick-values="chartTickValues"
                />
                <VisAxis
                  type="y"
                  :num-ticks="3"
                  :tick-line="false"
                  :domain-line="false"
                  :grid-line="true"
                  grid-line-color="var(--border, rgb(230 230 230))"
                  :tick-format="(d: number) => d > 0 ? `${d}分` : ''"
                />
                <VisTooltip
                  class-name="chart-tooltip"
                  :triggers="barTooltipTriggers"
                />
              </VisXYContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter class="flex-col items-start gap-2 text-xs border-t px-6 py-4">
            <div class="flex items-center justify-between w-full">
              <span class="text-muted-foreground tabular-nums">
                {{ monthlyData[0]?.dateStr }}
              </span>
              <span class="text-muted-foreground tabular-nums">
                最长单日 {{ monthlyMaxMinutes }} 分钟
              </span>
              <span class="text-muted-foreground tabular-nums">
                {{ monthlyData[monthlyData.length - 1]?.dateStr }}
              </span>
            </div>
          </CardFooter>
        </Card>
      </section>

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
            <ul v-if="pagedHistories.length" class="m-0 list-none divide-y p-0">
              <li v-for="history in pagedHistories" :key="history.id">
                <Item class="gap-3 rounded-none border-0 px-6 py-4">
                  <ItemMedia variant="icon" class="bg-muted text-muted-foreground">
                    <Timer aria-hidden="true" />
                  </ItemMedia>
                  <ItemContent class="min-w-0 gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div class="flex min-w-0 flex-1 items-center gap-4">
                      <ItemTitle class="shrink-0 text-base tabular-nums">
                        {{ Math.ceil(history.duration / 60) }} {{ t('minute') }}
                      </ItemTitle>
                      <time :datetime="dayjs(history.startTime).toISOString()" class="text-sm text-muted-foreground tabular-nums">
                        {{ dayjs(history.startTime).format('YYYY-MM-DD HH:mm') }}
                      </time>
                    </div>
                    <Button size="icon" variant="ghost" class="shrink-0 text-muted-foreground hover:text-destructive" @click="onDeleteHistory(history)">
                      <Trash2 class="size-4" aria-hidden="true" />
                    </Button>
                  </ItemContent>
                </Item>
              </li>
            </ul>
            <Empty v-else-if="!histories.length">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <History aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>暂无专注记录</EmptyTitle>
                <EmptyDescription>完成一次专注后，即可在这里查看记录。</EmptyDescription>
              </EmptyHeader>
            </Empty>
            <div v-if="histories.length > PAGE_SIZE" class="border-t px-3 py-4 sm:px-6">
              <nav aria-label="专注记录分页" class="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
                <Button
                  variant="outline"
                  size="sm"
                  :disabled="!hasPrevPage"
                  class="min-w-24 gap-1.5"
                  @click="goToPrevPage"
                >
                  <ChevronLeft class="size-4" aria-hidden="true" />
                  <span>上一页</span>
                </Button>
                <span aria-live="polite" aria-atomic="true" class="shrink-0 whitespace-nowrap text-center text-sm text-muted-foreground tabular-nums">
                  第 {{ currentPage }} / {{ totalPages }} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  :disabled="!hasNextPage"
                  class="min-w-24 gap-1.5"
                  @click="goToNextPage"
                >
                  <span>下一页</span>
                  <ChevronRight class="size-4" aria-hidden="true" />
                </Button>
              </nav>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  </main>
  <AlertDialog v-model:open="showDeleteDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>删除番茄场景</AlertDialogTitle>
        <AlertDialogDescription>
          此操作将删除「{{ scene?.name }}」及其全部 {{ count }} 条专注记录，无法恢复。是否确定删除？
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isDeleting">
          取消
        </AlertDialogCancel>
        <AlertDialogAction class="bg-destructive text-white hover:bg-destructive/90" :disabled="isDeleting" @click="confirmDelete">
          <Loader2 v-if="isDeleting" class="size-4 animate-spin" aria-hidden="true" />
          确认删除
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  <AlertDialog v-model:open="showDeleteHistoryDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>删除专注记录</AlertDialogTitle>
        <AlertDialogDescription>
          此操作将删除 {{ pendingDeleteHistory ? dayjs(pendingDeleteHistory.startTime).format('YYYY-MM-DD HH:mm') : '' }} 的 {{ pendingDeleteHistory ? Math.ceil(pendingDeleteHistory.duration / 60) : 0 }} 分钟专注记录，无法恢复。是否确定删除？
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isDeletingHistory" @click="cancelDeleteHistory">
          取消
        </AlertDialogCancel>
        <AlertDialogAction :disabled="isDeletingHistory" class="bg-destructive text-white hover:bg-destructive/90" @click.prevent="confirmDeleteHistory">
          <Loader2 v-if="isDeletingHistory" class="size-4 animate-spin" aria-hidden="true" />
          确认删除
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
