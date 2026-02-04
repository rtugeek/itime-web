<script lang="ts" setup>
import { BrowserWindowApi, MenuApi, TrayApi, type WidgetMenuItem } from '@widget-js/core'
import { useMenuListener, useWidget } from '@widget-js/vue3'
import { nextTick, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { Check, Pause, PlayOne, Right } from '@icon-park/vue-next'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { AppConfig } from '@/common/AppConfig'

import { usePomodoroStore } from '@/stores/usePomodoroStore'
import { usePomodoroWindowStateStore } from '@/widgets/pomodoro/usePomodoroWindowStateStore'
import PomodoroProgressBar from '@/widgets/pomodoro/components/PomodoroProgressBar.vue'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'
import { useTray } from '@/common/composition/useTray'

useWidget({ defaultOverlapMenu: false })
const { t } = useI18n()
const pomodoroStore = usePomodoroStore()

const { stickScreenEdge } = usePomodoroWindowStateStore()

const { scenes, currentScene, remindText, isRunning, status, currentSceneId } = storeToRefs(pomodoroStore)

const defaultPomodoro = useStorage(AppConfig.KEY_POMODORO_INIT, false)

pomodoroStore.loadScenes()
onMounted(async () => {
  await nextTick()
  if (!defaultPomodoro.value) {
    PomodoroSceneRepository.createDefaultScenes()
    defaultPomodoro.value = true
  }
})

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

useMenuListener((type, menu) => {
  if (menu.id == 'exit') {
    BrowserWindowApi.close()
  }
  else if (menu.id == 'reposition') {
    BrowserWindowApi.center()
  }
  else if (menu.id == 'addScene') {
    BrowserWindowApi.openUrl('/pomodoro/scene/add?frame=true&transparent=false&width=400&height=700')
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
    maxWidth: AppConfig.SIZE_POMODORO_WINDOW,
    maxHeight: AppConfig.SIZE_POMODORO_WINDOW,
    alwaysOnTop: true,
    resizable: false,
  })
})

useTray({
  image: '/pomodoro.ico',
  onMouseEnter: () => {
    BrowserWindowApi.setAlwaysOnTop(true)
    stickScreenEdge.showWindow()
  },
  onMouseLeave: () => {
    stickScreenEdge.startHideWindow()
  },
})

TrayApi.setContextMenu([
  {
    label: '退出',
    id: 'exit',
  },
  {
    label: '添加场景',
    id: 'addScene',
  },
])
</script>

<template>
  <div>
    <div
      v-drag-window
      class="pomodoro flex flex-col gap-2 justify-center items-center overflow-hidden" :class="{ [status]: true }"
    >
      <template v-if="currentScene">
        <div class="scene">
          <div class="flex gap-1 items-center cursor-pointer" @click="onSceneClick">
            <div>{{ currentScene.icon }}</div>
            <div>{{ status === 'resting' ? t('pomodoro.resting') : currentScene.name }}</div>
            <Right v-show="status === 'stop'" />
          </div>
        </div>
        <div v-drag-window class="text-5xl font-bold time rubik-regular">
          {{ remindText }}
        </div>
        <div class="flex gap-4 buttons">
          <div v-if="!isRunning && status !== 'waiting'" class="btn start" @click="pomodoroStore.start()">
            <PlayOne />
          </div>
          <div v-if="isRunning && status !== 'waiting'" class="btn small" @click="pomodoroStore.pause()">
            <Pause />
          </div>
          <div v-if="isRunning || status === 'waiting' || status === 'resting'" class="btn small" @click="pomodoroStore.stop()">
            <Check />
          </div>
        </div>
      </template>
      <div v-else class="flex text-center p-4">
        {{ t('pomodoro.emptyTip') }}
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
  position: relative;
  height: 100vh;
  width: 100vw;
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

.i-icon {
  line-height: 0.5rem;
}

@media (prefers-color-scheme: dark) {
  .pomodoro {
    color: rgb(238, 247, 255);
  }
}
</style>
