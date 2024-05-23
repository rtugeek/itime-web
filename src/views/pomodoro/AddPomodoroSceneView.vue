<script lang="ts" setup>
import { BrowserWindowApi } from '@widget-js/core'
import { computed, reactive, ref, toRaw } from 'vue'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import { useRoute, useRouter } from 'vue-router'
import { showNotify } from '@nutui/nutui'
import type { PomodoroScene } from '@/data/PomodoroScene'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'

BrowserWindowApi.setAlwaysOnTop(true)
const router = useRouter()
const route = useRoute()
const id = route.query.id as string

const title = computed(
  () => id ? '编辑场景' : '添加场景',
)

const sence = reactive<PomodoroScene>({
  id: undefined,
  icon: '🔨',
  name: '',
})

if (id) {
  PomodoroSceneRepository.get(id).then((res) => {
    sence.id = id
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
    showNotify.warn('名称不能为空')
    return
  }
  PomodoroSceneRepository.save(toRaw(sence))
  router.back()
}

function deleteScene() {
  PomodoroSceneRepository.remove(sence.id!)
  router.back()
}
</script>

<template>
  <BaseView :title="title">
    <nut-popup v-model:visible="showEmojiPicker" :style="{ padding: '30px 50px', backgroundColor: 'transparent' }">
      <EmojiPicker :native="true" display-recent @select="onSelectEmoji" />
    </nut-popup>
    <div class="section mt-4">
      <h5>图标与名称</h5>
      <nut-form label-position="top">
        <nut-form-item>
          <div class="flex items-center gap-2">
            <nut-avatar shape="square" bg-color="#ece8da" class="cursor-pointer" @click="showEmojiPicker = true">
              <div class="flex items-center justify-center emoji text-xl h-full">
                {{ sence.icon }}
              </div>
            </nut-avatar>
            <nut-input v-model="sence.name" placeholder="请输入场景名称" />
          </div>
        </nut-form-item>
      </nut-form>
    </div>
    <div class="fixed-right-bottom gap-2 flex">
      <FloatingActionButton v-if="id" type="danger" icon="delete" @click="deleteScene" />
      <FloatingActionButton icon="check" @click="save" />
    </div>
  </BaseView>
</template>

<style lang="scss">
@import url('@/assets/common.scss');
.section{
  h5{
    padding-left: 1rem;
  }
}
</style>
