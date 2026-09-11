<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Plus } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import PomodoroSceneList from '@/widgets/pomodoro/components/PomodoroSceneList.vue'

const router = useRouter()
function goAdd() {
  router.push({ name: 'PomodoroSceneAdd' })
}
</script>

<template>
  <main class="min-w-0 flex-1 p-3 sm:p-4">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div class="space-y-2">
          <h1 id="pomodoro-list-title" class="text-2xl font-semibold tracking-tight !text-foreground sm:text-3xl">
            番茄钟
          </h1>
        </div>
        <Button @click="goAdd">
          <Plus class="size-4" aria-hidden="true" />
          新建场景
        </Button>
      </header>

      <section aria-labelledby="pomodoro-list-title" class="space-y-4">
        <PomodoroSceneList />
      </section>
    </div>
  </main>
</template>
