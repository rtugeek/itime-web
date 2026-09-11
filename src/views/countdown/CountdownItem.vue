<script setup lang="ts">
import { type PropType, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, CalendarDays, ChevronRight, Pencil, Trash2 } from '@lucide/vue'
import dayjs from 'dayjs'
import type { CountdownEvent } from '@/data/CountdownEvent'
import { useCountdownEventStore } from '@/stores/useCountdownEventStore'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

const props = defineProps({
  event: {
    type: Object as PropType<CountdownEvent>,
    required: true,
  },
})
const router = useRouter()
const countdownStore = useCountdownEventStore()
const showDeleteDialog = ref(false)
const days = computed(() => props.event.getCountdownDays())
const countdownLabel = computed(() => days.value < 0 ? '已经' : '还有')

function onClick() {
  router.push({ name: 'CountdownAdd', query: { id: props.event.id } })
}
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
      <button
        type="button"
        class="group flex h-full w-full min-w-0 cursor-pointer items-center gap-4 rounded-xl border border-border bg-transparent p-3 text-left text-foreground shadow-xs transition-colors hover:border-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-4"
        @click="onClick"
      >
        <div class="min-w-0 flex-1 space-y-2">
          <div class="break-words text-base font-semibold leading-6 [overflow-wrap:anywhere]">
            {{ event.name }}
          </div>
          <p v-if="event.note?.trim()" class="whitespace-pre-wrap break-words text-xs leading-5 text-muted-foreground [overflow-wrap:anywhere]">
            {{ event.note }}
          </p>
          <div class="flex min-w-0 flex-wrap items-center gap-2 text-xs leading-5 text-muted-foreground">
            <span class="inline-flex min-w-0 items-center gap-1.5">
              <CalendarDays class="size-4 shrink-0" aria-hidden="true" />
              <span class="break-words">{{ event.getDateTimeText() }}</span>
            </span>
            <span v-if="event.dateType === 1" class="inline-flex items-center gap-1.5">
              <Calendar class="size-4 shrink-0" aria-hidden="true" />
              <span class="sr-only">公历</span>
              {{ dayjs(event.dateTime).format('YYYY年MM月DD日') }}
            </span>
          </div>
        </div>
        <div class="shrink-0 text-right">
          <template v-if="days === 0">
            <span class="text-2xl font-semibold tracking-tight">今天</span>
          </template>
          <template v-else>
            <div class="flex items-baseline justify-end gap-1">
              <span class="text-xs text-muted-foreground">{{ countdownLabel }}</span>
              <span class="text-3xl font-semibold tracking-tight tabular-nums">{{ Math.abs(days) }}</span>
              <span class="text-xs text-muted-foreground">天</span>
            </div>
          </template>
        </div>
        <ChevronRight class="hidden size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-foreground sm:block" aria-hidden="true" />
      </button>
    </ContextMenuTrigger>
    <ContextMenuContent class="w-36" @close-auto-focus="showDeleteDialog && $event.preventDefault()">
      <ContextMenuItem @select="onClick">
        <Pencil class="size-4" aria-hidden="true" />
        编辑
      </ContextMenuItem>
      <ContextMenuItem variant="destructive" class="text-destructive focus:text-destructive" @select="showDeleteDialog = true">
        <Trash2 class="size-4 text-destructive" aria-hidden="true" />
        删除
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
  <AlertDialog v-model:open="showDeleteDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>删除倒计时？</AlertDialogTitle>
        <AlertDialogDescription>确定要删除“{{ event.name }}”吗？</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction class="bg-destructive text-white hover:bg-destructive/90" @click="countdownStore.deleteCountdown(String(event.id))">
          确认删除
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
