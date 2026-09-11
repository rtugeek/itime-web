<script setup lang="ts">
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { CalendarDays, Plus } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { useCountdownEventStore } from '@/stores/useCountdownEventStore'
import CountdownItem from '@/views/countdown/CountdownItem.vue'

const router = useRouter()
const countdownEventStore = useCountdownEventStore()
const { events } = storeToRefs(countdownEventStore)
function goAdd() {
  router.push({ name: 'CountdownAdd' })
}
</script>

<template>
  <main class="min-w-0 flex-1 p-3 sm:p-4">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div class="space-y-2">
          <h1 id="countdown-list-title" class="text-2xl font-semibold tracking-tight !text-foreground sm:text-3xl">
            倒计时
          </h1>
        </div>
        <Button class="rounded-lg" @click="goAdd">
          <Plus class="size-4" aria-hidden="true" />
          新建倒计时
        </Button>
      </header>

      <section aria-labelledby="countdown-list-title" class="space-y-4">
        <ul v-if="events.length" class="grid list-none grid-cols-1 gap-4 p-0 lg:grid-cols-2">
          <li v-for="event in events" :key="event.id" class="min-w-0">
            <CountdownItem :event="event" />
          </li>
        </ul>
        <Empty v-else class="rounded-xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarDays class="size-6" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>添加第一个重要日子</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" @click="goAdd">
              <Plus class="size-4" aria-hidden="true" />
              添加日子
            </Button>
          </EmptyContent>
        </Empty>
      </section>
    </div>
  </main>
</template>
