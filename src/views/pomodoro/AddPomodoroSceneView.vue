<script lang="ts" setup>
import { BrowserWindowApi } from '@widget-js/core'
import { computed, reactive, ref, toRaw } from 'vue'
import EmojiPicker from 'vue3-emoji-picker'
import { Delete } from '@icon-park/vue-next'
import 'vue3-emoji-picker/css'

import { useRoute, useRouter } from 'vue-router'
import { showNotify } from '@nutui/nutui'
import { useI18n } from 'vue-i18n'
import type { PomodoroScene } from '@/data/PomodoroScene'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'
import { usePomodoroStore } from '@/stores/usePomodoroStore'
import FloatingActionButton from '@/components/FloatingActionButton.vue'
import { AppUtils } from '@/utils/AppUtils'

BrowserWindowApi.setAlwaysOnTop(true)
const router = useRouter()
const route = useRoute()
const id = route.query.id as string
const { t } = useI18n()
const pomodoroStore = usePomodoroStore()
const title = computed(
  () => id ? t('pomodoro.scene.edit') : t('pomodoro.scene.add'),
)

const sence = reactive<PomodoroScene>({
  id: undefined,
  icon: '🔨',
  name: '',
  duration: 0,
})

if (id) {
  PomodoroSceneRepository.get(id).then((res) => {
    sence.id = Number.parseInt(id)
    if (res) {
      sence.createTime = res.createTime
      sence.icon = res.icon
      sence.name = res.name
    }
  })
}

const showEmojiPicker = ref(false)

function onSelectEmoji(newEmoji: any) {
  sence.icon = newEmoji.i
  showEmojiPicker.value = false
}

function save() {
  if (!sence.name.trim()) {
    showNotify.warn(t('pomodoro.error.name'))
    return
  }
  pomodoroStore.saveScene(toRaw(sence))
  AppUtils.back(router)
}

function deleteScene() {
  pomodoroStore.deleteScene(sence.id!)
  AppUtils.back(router)
}
</script>

<template>
  <BaseView :title="title">
    <nut-popup v-model:visible="showEmojiPicker" :style="{ padding: '30px 50px', backgroundColor: 'transparent' }">
      <EmojiPicker :native="true" display-recent @select="onSelectEmoji" />
    </nut-popup>
    <div class="section mt-4">
      <h5>{{ t('pomodoro.iconAndName') }}</h5>
      <nut-form label-position="top">
        <nut-form-item>
          <div class="flex items-center gap-2">
            <nut-avatar shape="square" bg-color="#ece8da" class="cursor-pointer" @click="showEmojiPicker = true">
              <div class="flex items-center justify-center emoji text-xl h-full">
                {{ sence.icon }}
              </div>
            </nut-avatar>
            <nut-input v-model="sence.name" :placeholder="t('pomodoro.scene.placeholder')" />
          </div>
        </nut-form-item>
      </nut-form>
    </div>
    <div class="fixed-right-bottom gap-2 flex">
      <FloatingActionButton v-if="id" v-no-android type="danger" @click="deleteScene">
        <Delete size="24" />
      </FloatingActionButton>
      <FloatingActionButton @click="save" />
    </div>
  </BaseView>
</template>

<style lang="scss">
@import url('@/assets/common.scss');

.section {
  h5 {
    padding-left: 1rem;
  }
}
</style>
