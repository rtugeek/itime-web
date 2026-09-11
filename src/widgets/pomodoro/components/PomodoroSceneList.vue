<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Plus, Timer } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Item } from '@/components/ui/item'
import { usePomodoroStore } from '@/stores/usePomodoroStore'
import PomodoroSceneItem from '@/widgets/pomodoro/components/PomodoroSceneItem.vue'

const pomodoroStore = usePomodoroStore()
const { scenes } = storeToRefs(pomodoroStore)
pomodoroStore.loadScenes()
</script>

<template>
  <ul v-if="scenes.length" class="m-0 grid list-none gap-3 p-0">
    <li v-for="scene in scenes" :key="scene.id" class="min-w-0">
      <Item as-child variant="outline" class="bg-card text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        <RouterLink :to="{ name: 'PomodoroDetail', query: { id: scene.id } }">
          <PomodoroSceneItem :scene="scene" />
        </RouterLink>
      </Item>
    </li>
  </ul>
  <Empty v-else class="rounded-xl border">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Timer aria-hidden="true" />
      </EmptyMedia>
      <EmptyTitle>创建第一个专注场景</EmptyTitle>
      <EmptyDescription>为阅读、工作或学习创建场景，开始记录专注时间。</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button as-child variant="outline">
        <RouterLink :to="{ name: 'PomodoroSceneAdd' }">
          <Plus class="size-4" aria-hidden="true" />
          新建场景
        </RouterLink>
      </Button>
    </EmptyContent>
  </Empty>
</template>
