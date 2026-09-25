<script lang="ts" setup>
import { BrowserWindowApi, Channel, MenuApi, TrayApi, type WidgetMenuItem } from '@widget-js/core'
import { useIpcListener, useMenuListener, useWidget } from '@widget-js/vue3'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { Check, ChevronRight, Grip, Pause, Play, Plus } from '@lucide/vue'

import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { AppConfig } from '@/common/AppConfig'

import { usePomodoroStore } from '@/stores/usePomodoroStore'
import { usePomodoroWindowStateStore } from '@/widgets/pomodoro/usePomodoroWindowStateStore'
import PomodoroProgressBar from '@/widgets/pomodoro/components/PomodoroProgressBar.vue'
import { useTray } from '@/common/composition/useTray'
import { createWindowSizeGuard } from '@/widgets/pomodoro/windowSizeGuard'

useWidget({ defaultOverlapMenu: false })
const { t } = useI18n()
const pomodoroStore = usePomodoroStore()

const { stickScreenEdge } = usePomodoroWindowStateStore()
const manuallyHidden = ref(false)
let positionReady = false

function updateTrayMenu() {
  TrayApi.setContextMenu([
    {
      label: '主页',
      id: 'home',
    },
    {
      label: '隐藏',
      id: 'hide',
      type: 'checkbox',
      checked: manuallyHidden.value,
    },
    {
      label: '退出',
      id: 'exit',
    },
    {
      label: '添加场景',
      id: 'addScene',
    },
  ])
}

useIpcListener(Channel.BROWSER_WINDOW, (event) => {
  if (positionReady && event === BrowserWindowApi.EVENT_MOVED) {
    void stickScreenEdge.onMoved()
  }
})

let stopWindowSizeGuard: (() => void) | undefined
let disposed = false

onUnmounted(() => {
  disposed = true
  stopWindowSizeGuard?.()
  stickScreenEdge.dispose()
  document.body.removeEventListener('mouseenter', onWindowEnter)
  document.body.removeEventListener('mouseleave', onWindowLeave)
})

function onWindowEnter() {
  stickScreenEdge.cancelHide()
  if (!stickScreenEdge.isShowed) {
    void stickScreenEdge.showWindow()
  }
}

function onWindowLeave() {
  stickScreenEdge.startHideWindow()
}

const { scenes, currentScene, remindText, isRunning, status, currentSceneId } = storeToRefs(pomodoroStore)

watch(status, (value, oldValue) => {
  if (value === 'waiting' || (oldValue === 'resting' && (value === 'stop' || value === 'running'))) {
    manuallyHidden.value = false
    updateTrayMenu()
  }
})

pomodoroStore.loadScenes()

function onSceneClick() {
  if (isRunning.value) {
    return
  }
  const menus = scenes.value.map((it) => {
    const menu: WidgetMenuItem = {
      id: it.id!.toString(),
      label: `${it.icon} ${it.name}`,
      type: 'radio',
      checked: currentSceneId.value == it.id,
    }
    return menu
  })
  MenuApi.showMenu({
    menuItems: menus,
  })
}

function onAddSceneClick() {
  BrowserWindowApi.openUrl('/pomodoro/scene/add?frame=true&transparent=false&width=900&height=700')
}

useMenuListener((type, menu) => {
  if (menu.id == 'exit') {
    BrowserWindowApi.close()
  }
  else if (menu.id == 'reposition') {
    stickScreenEdge.resetPosition()
  }
  else if (menu.id == 'addScene') {
    onAddSceneClick()
  }
  else if (menu.id == 'home') {
    BrowserWindowApi.openUrl('/pomodoro?frame=true&transparent=false&width=1200&height=800')
  }
  else if (menu.id == 'hide') {
    manuallyHidden.value = !manuallyHidden.value
    if (manuallyHidden.value) {
      stickScreenEdge.cancelHide()
      void BrowserWindowApi.hide()
    }
    else {
      void BrowserWindowApi.show().then(() => {
        void stickScreenEdge.showWindow()
      })
    }
    updateTrayMenu()
  }
  else {
    const scene = scenes.value.find(it => it.id?.toString() == menu.id)
    if (scene) {
      currentSceneId.value = scene.id!
    }
  }
})
onMounted(async () => {
  await nextTick()
  await BrowserWindowApi.setup({
    width: AppConfig.SIZE_POMODORO_WINDOW,
    height: AppConfig.SIZE_POMODORO_WINDOW,
    minWidth: AppConfig.SIZE_POMODORO_WINDOW,
    minHeight: AppConfig.SIZE_POMODORO_WINDOW,
    maxWidth: AppConfig.SIZE_POMODORO_WINDOW,
    maxHeight: AppConfig.SIZE_POMODORO_WINDOW,
    alwaysOnTop: true,
    resizable: false,
    movable: true,
  })
  await BrowserWindowApi.setMovable(true)
  if (!disposed) {
    stopWindowSizeGuard = createWindowSizeGuard(BrowserWindowApi, AppConfig.SIZE_POMODORO_WINDOW)
    document.body.addEventListener('mouseenter', onWindowEnter)
    document.body.addEventListener('mouseleave', onWindowLeave)
    await stickScreenEdge.resetPosition()
    positionReady = !disposed
    if (!disposed) { stickScreenEdge.startHideWindow() }
  }
})

useTray({
  image: '/pomodoro.ico',
  onClick: () => {
    if (manuallyHidden.value) {
      manuallyHidden.value = false
      void BrowserWindowApi.show().then(() => {
        void stickScreenEdge.showWindow()
      })
      updateTrayMenu()
    }
    else {
      onWindowEnter()
    }
  },
  onMouseEnter: () => {
    if (!manuallyHidden.value) {
      BrowserWindowApi.setAlwaysOnTop(true)
      stickScreenEdge.showWindow()
    }
  },
  onMouseLeave: () => {
    if (!manuallyHidden.value) {
      stickScreenEdge.startHideWindow()
    }
  },
})

updateTrayMenu()
</script>

<template>
  <div class="pomodoro-root">
    <div
      class="pomodoro flex flex-col gap-2 justify-center items-center overflow-hidden" :class="{ [status]: true }"
    >
      <div class="pomodoro-drag-handle" :title="t('pomodoro.dragWindow')" :aria-label="t('pomodoro.dragWindow')" role="img">
        <Grip :size="16" aria-hidden="true" />
      </div>
      <template v-if="currentScene">
        <div class="scene">
          <div class="flex gap-1 items-center cursor-pointer" @click="onSceneClick">
            <div>{{ currentScene.icon }}</div>
            <div>{{ status === 'resting' ? t('pomodoro.resting') : currentScene.name }}</div>
            <ChevronRight v-show="status === 'stop'" />
          </div>
        </div>
        <div class="text-5xl font-bold time rubik-regular">
          {{ remindText }}
        </div>
        <div class="flex gap-4 buttons">
          <div v-if="!isRunning && status !== 'waiting'" class="btn start" @click="pomodoroStore.start()">
            <Play />
          </div>
          <div v-if="isRunning && status !== 'waiting'" class="btn small" @click="pomodoroStore.pause()">
            <Pause />
          </div>
          <div v-if="isRunning || status === 'waiting' || status === 'resting'" class="btn small" @click="pomodoroStore.stop()">
            <Check />
          </div>
        </div>
      </template>
      <div v-else class="flex flex-col items-center text-center p-4">
        <button
          type="button"
          class="add-scene-btn"
          :title="t('pomodoro.addScene')"
          :aria-label="t('pomodoro.addScene')"
          @click="onAddSceneClick"
        >
          <Plus :size="20" aria-hidden="true" />
          <span>{{ t('pomodoro.addScene') }}</span>
        </button>
      </div>
    </div>
    <PomodoroProgressBar />
  </div>
</template>

<style lang="scss">
body {
  background-color: transparent;
  overflow: hidden;
}

.pomodoro-root {
  position: relative;
  width: 100vw;
  height: 100vh;
}

@keyframes wiggle {
  0% {
    transform: translate(1px, 1px) rotate(0deg);
  }
  10% {
    transform: translate(-1px, -2px) rotate(-1deg);
  }
  20% {
    transform: translate(-3px, 0px) rotate(1deg);
  }
  30% {
    transform: translate(3px, 2px) rotate(0deg);
  }
  40% {
    transform: translate(1px, -1px) rotate(1deg);
  }
  50% {
    transform: translate(-1px, 2px) rotate(-1deg);
  }
  60% {
    transform: translate(-3px, 1px) rotate(0deg);
  }
  70% {
    transform: translate(3px, 1px) rotate(-1deg);
  }
  80% {
    transform: translate(-1px, -1px) rotate(1deg);
  }
  90% {
    transform: translate(1px, 2px) rotate(0deg);
  }
  100% {
    transform: translate(1px, -2px) rotate(-1deg);
  }
}

.pomodoro {
  user-select: none;
  position: relative;
  height: 100%;
  width: 100%;
  border-radius: 22px;
  overflow: hidden;
  color: rgb(0, 16, 24);
  font-size: var(--widget-font-size);

  * {
    transition: all 0.3s ease-out;
  }

  &:hover {
    .scene {
      margin-top: 0;
    }

    .buttons {
      opacity: 1;
    }

    .pomodoro-drag-handle {
      opacity: 1;
    }
  }

  .scene {
    margin-top: 1rem;
  }

  .buttons {
    opacity: 0;
    color: white;
  }

  &.waiting {
    .time {
      animation: wiggle 0.5s;
      animation-iteration-count: infinite;
    }
  }
}

.pomodoro-drag-handle {
  app-region: drag;
  -webkit-app-region: drag;
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: grab;
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.btn {
  cursor: pointer;
  background-color: var(--widget-primary-color);
  border-radius: 50%;
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  font-size: 1.5rem;
  justify-content: center;
  align-items: center;

  &.small {
    width: 2rem;
    height: 2rem;
    font-size: 1.2rem;
  }
}

.add-scene-btn {
  cursor: pointer;
  background-color: var(--widget-primary-color);
  color: white;
  border: none;  border-radius: 9999px;
  padding: 0.55rem 1.1rem;
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  line-height: 1;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  transition: transform 0.15s ease-out, box-shadow 0.15s ease-out, filter 0.15s ease-out;

  &:hover {
    filter: brightness(1.08);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.14);
  }
}

.i-icon {
  line-height: 0.5rem;
}

@media (prefers-color-scheme: dark) {
  .pomodoro {
    color: rgb(238, 247, 255);
  }
}
</style>
