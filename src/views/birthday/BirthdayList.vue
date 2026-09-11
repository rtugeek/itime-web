<script setup lang="ts">
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Cake, Calendar, CalendarDays, ChevronRight, Plus } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { useBirthdayStore } from '@/stores/useBirthdayStore'
import { BirthdayWrapper } from '@/data/BirthdayWrapper'

const router = useRouter()
const store = useBirthdayStore()
const { birthdayList } = storeToRefs(store)
function goAdd() {
  router.push({ name: 'BirthdayAdd' })
}
function goEdit(id: number | string) {
  router.push({ name: 'BirthdayAdd', query: { id: String(id) } })
}
</script>

<template>
  <main class="min-w-0 flex-1 p-3 sm:p-4">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div class="space-y-2">
          <h1 id="birthday-list-title" class="text-2xl font-semibold tracking-tight !text-foreground sm:text-3xl">
            生日
          </h1>
        </div>
        <Button class="rounded-lg" @click="goAdd">
          <Plus class="size-4" aria-hidden="true" />
          添加生日
        </Button>
      </header>

      <section aria-labelledby="birthday-list-title" class="space-y-4">
        <ul v-if="birthdayList.length" class="grid list-none grid-cols-1 gap-4 p-0 lg:grid-cols-2">
          <li
            v-for="birthday in birthdayList"
            :key="birthday.id"
            class="min-w-0"
          >
            <button
              type="button"
              class="group flex h-full w-full min-w-0 cursor-pointer items-center gap-4 rounded-xl border border-border bg-transparent p-3 text-left text-foreground shadow-xs transition-colors hover:border-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-4"
              @click="goEdit(birthday.id)"
            >
              <div class="min-w-0 flex-1 space-y-2">
                <div class="break-words text-base font-semibold leading-6 [overflow-wrap:anywhere]">
                  {{ birthday.name }}
                </div>
                <div class="flex min-w-0 flex-wrap items-center gap-2 text-xs leading-5 text-muted-foreground">
                  <span class="inline-flex min-w-0 items-center gap-1.5">
                    <CalendarDays class="size-4 shrink-0" aria-hidden="true" />
                    <span class="break-words">{{ new BirthdayWrapper(birthday).toString() }}</span>
                  </span>
                  <span v-if="birthday.dateType === 1" class="inline-flex min-w-0 items-center gap-1.5">
                    <Calendar class="size-4 shrink-0" aria-hidden="true" />
                    <span class="sr-only">公历</span>
                    <span class="break-words">{{ new BirthdayWrapper(birthday).toString(0) }}</span>
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <Cake class="size-4 shrink-0" aria-hidden="true" />
                    <span>{{ Math.max(0, new Date().getFullYear() - new BirthdayWrapper(birthday).getSourceSolarDate().getFullYear()) }}岁</span>
                  </span>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <span v-if="new BirthdayWrapper(birthday).isToday()" class="text-2xl font-semibold tracking-tight">今天生日</span>
                <div v-else class="flex items-baseline justify-end gap-1">
                  <span class="text-xs text-muted-foreground">还有</span>
                  <span class="text-3xl font-semibold tracking-tight tabular-nums">{{ new BirthdayWrapper(birthday).countdown() }}</span>
                  <span class="text-xs text-muted-foreground">天</span>
                </div>
              </div>
              <ChevronRight class="hidden size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-foreground sm:block" aria-hidden="true" />
            </button>
          </li>
        </ul>
        <div v-else class="flex flex-col items-center rounded-xl border border-dashed px-4 py-8 text-center">
          <div class="mb-5 flex size-12 items-center justify-center rounded-xl border text-muted-foreground">
            <CalendarDays class="size-6" aria-hidden="true" />
          </div>
          <h3 class="text-base font-medium !text-foreground">
            添加第一个重要的生日
          </h3>
          <p class="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
            记录家人、朋友的生日，不错过每一个重要时刻。
          </p>
          <Button variant="outline" class="mt-6" @click="goAdd">
            <Plus class="size-4" aria-hidden="true" />
            添加生日
          </Button>
        </div>
      </section>
    </div>
  </main>
</template>
