<script lang="ts" setup>
import { WidgetData } from '@widget-js/core'
import { useWidget } from '@widget-js/vue3'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { Check, Pause, PlayOne, Right } from '@icon-park/vue-next'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import type { PomodoroModel } from '@/widgets/pomodoro/PomodoroModel'
import { AppConfig } from '@/common/AppConfig'
import { type PomodoroSettings, getDefaultPomodoroSettings } from '@/data/PomodoroSettings'

import 'vue-scroll-picker/lib/style.css'
import SceneScrollPicker from '@/widgets/pomodoro/components/SceneScrollPicker.vue'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'
import { usePomodoroSceneStore } from '@/stores/pomodoroSceneStore'

useWidget(WidgetData)
const pomoSettings = useStorage<PomodoroSettings>(AppConfig.KEY_POMODORO_SETTINGS, getDefaultPomodoroSettings())
const sceneStore = usePomodoroSceneStore()
const { scenes } = storeToRefs(sceneStore)
const model = reactive<PomodoroModel>({
  pauseDuration: 0,
  status: 'stop',
  startAt: new Date(),
  finishAt: new Date(),
  totalDuration: 0,
})

const isRunning = computed(() => model.status === 'running')
const defaultPomodoro = useStorage(AppConfig.KEY_POMODORO_INIT, false)
function start() {
  model.status = 'running'
  model.startAt = new Date()
  // model.finishAt = dayjs().add(pomoSettings.pomoTime, 'minute').toDate()
}

const showScenePicker = ref(false)
const sceneId = useStorage(AppConfig.KEY_POMODORO_USING_SCENE, '1')
const currentScene = computed(() => scenes.value.find(it => it.id === sceneId.value)!)

sceneStore.reload()
onMounted(async () => {
  await nextTick()
  if (!defaultPomodoro.value) {
    PomodoroSceneRepository.createDefaultScenes()
    defaultPomodoro.value = true
  }
})
</script>

<template>
  <widget-wrapper>
    <div class="pomodoro flex flex-col gap-2 justify-center items-center">
      <SceneScrollPicker v-if="currentScene" v-show="showScenePicker" v-model="sceneId" v-model:show="showScenePicker" class="absolute w-full h-full bg-white" />
      <div class="scene">
        <div v-if="currentScene" class="flex gap-1 items-center cursor-pointer" @click="showScenePicker = true">
          <div>{{ currentScene.icon }}</div>
          <div>{{ currentScene.name }}</div>
          <Right />
        </div>
      </div>
      <div class="text-5xl">
        {{ dayjs.duration(pomoSettings.pomoTime, 'minute').format('mm:ss') }}
      </div>
      <div class="flex gap-4">
        <div v-if="!isRunning" class="btn start" @click="start">
          <PlayOne />
        </div>
        <div v-if="isRunning" class="btn small">
          <Pause />
        </div>
        <div v-if="isRunning" class="btn small">
          <Check />
        </div>
      </div>
    </div>
  </widget-wrapper>
</template>

<style lang="scss">
body{
  background-color: transparent;
}

.pomodoro {
  position: relative;
  overflow: hidden;
  background-color: var(--widget-background-color);
  border-radius: var(--widget-border-radius);
  color: var(--widget-color);
  font-size: var(--widget-font-size);
  transition: all 0.3s ease-out;
}

.btn{
  cursor: pointer;
  background-color: var(--widget-primary-color);
  border-radius: 50%;
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  font-size: 1.5rem;
  justify-content: center;
  align-items: center;
  &.small{
    width: 2rem;
    height: 2rem;
    font-size: 1.2rem;
  }
}

.i-icon{
 line-height: 0.5rem;
}
</style>
