<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { Plus } from '@lucide/vue'
import { usePomodoroStore } from '@/stores/usePomodoroStore'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AppConfig } from '@/common/AppConfig'
import { DefaultScenes } from '@/data/PomodoroScene'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'
import PomodoroSceneList from '@/widgets/pomodoro/components/PomodoroSceneList.vue'

const router = useRouter()
const store = usePomodoroStore()
const initialized = useStorage(AppConfig.KEY_POMODORO_INIT, false)
const sceneOptions = ref(DefaultScenes.map(scene => ({ scene, selected: true })))
const creating = ref(false)
const creationError = ref('')

function skipDefaultScenes() {
  initialized.value = true
}

async function confirmDefaultScenes() {
  if (creating.value) { return }
  creating.value = true
  creationError.value = ''
  try {
    await PomodoroSceneRepository.createDefaultScenes(
      sceneOptions.value.filter(option => option.selected).map(option => option.scene),
    )
    await store.loadScenes()
    initialized.value = true
    void store.sync().catch(() => {})
  }
  catch {
    creationError.value = '创建场景失败，请重试'
  }
  finally {
    creating.value = false
  }
}

function goAdd() {
  router.push({ name: 'PomodoroSceneAdd' })
}
</script>

<template>
  <main class="min-w-0 flex-1 p-3 sm:p-4">
    <Dialog :open="!initialized">
      <DialogContent :show-close-button="false" @interact-outside.prevent @escape-key-down.prevent>
        <DialogHeader>
          <DialogTitle>选择专注场景</DialogTitle>
          <DialogDescription>选择你想创建的场景，也可以跳过，稍后自行添加。</DialogDescription>
        </DialogHeader>
        <div class="grid grid-cols-2 gap-3">
          <label
            v-for="option in sceneOptions"
            :key="option.scene.id"
            class="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-accent/50"
          >
            <Checkbox v-model="option.selected" :disabled="creating" />
            <span class="text-2xl" aria-hidden="true">{{ option.scene.icon }}</span>
            <span>{{ option.scene.name }}</span>
          </label>
        </div>
        <p v-if="creationError" role="alert" class="text-sm text-destructive">
          {{ creationError }}
        </p>
        <DialogFooter>
          <Button variant="outline" :disabled="creating" @click="skipDefaultScenes">
            跳过
          </Button>
          <Button :disabled="creating" @click="confirmDefaultScenes">
            {{ creating ? '创建中…' : '确定' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div class="space-y-2">
          <h1 id="pomodoro-list-title" class="text-2xl font-semibold tracking-tight !text-foreground sm:text-3xl">
            番茄钟
          </h1>
        </div>
        <div class="flex items-center gap-3">
          <Button @click="goAdd">
            <Plus class="size-4" aria-hidden="true" />
            新建场景
          </Button>
        </div>
      </header>

      <section aria-labelledby="pomodoro-list-title" class="space-y-4">
        <PomodoroSceneList />
      </section>
    </div>
  </main>
</template>
