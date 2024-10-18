<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import dayjs from 'dayjs'
import { PomodoroUtils } from '@/utils/PomodoroUtils'
import type { PomodoroScene } from '@/data/PomodoroScene'
import PomodoroDetailBlock from '@/views/pomodoro/PomodoroDetailBlock.vue'
import { usePomodoroHistoryStore } from '@/stores/usePomodoroHistoryStore'
import { usePomodoroSceneStore } from '@/stores/usePomodoroSceneStore'
import type { PomodoroHistory } from '@/data/PomodoroHistory'

const route = useRoute()
const router = useRouter()
const id = route.query.id as string
const scene = ref<PomodoroScene>()
const histories = ref<PomodoroHistory[]>()
const checkInDayCount = ref(0)
const count = ref(0)

const pomodoroHistory = usePomodoroHistoryStore()
const pomodoroSceneStore = usePomodoroSceneStore()
pomodoroSceneStore.findById(id).then((data) => {
  if (data) {
    scene.value = data
    pomodoroHistory.findBySceneId(id).then((his) => {
      histories.value = his
      const date = new Set<string>()
      his.forEach((history) => {
        date.add(dayjs(history.finishAt).format('YYYY-MM-DD'))
      })
      checkInDayCount.value = date.size
      count.value = history.length
    })
  }
  else {
    router.back()
  }
})

function onEdit() {
  router.push({ name: 'AddPomodoroSceneView', query: { id } })
}
</script>

<template>
  <BaseView v-if="scene" :title="`${scene.icon} ${scene.name}`" class="detail-root">
    <div class="flex flex-col gap-2 p-2 overflow-auto">
      <div class="flex gap-2">
        <PomodoroDetailBlock title="累计时长" :content="PomodoroUtils.getTotalHour(scene)" unit="小时" />
        <PomodoroDetailBlock title="打卡天数" :content="checkInDayCount" unit="天" />
        <PomodoroDetailBlock title="总记录数" :content="count" unit="个" />
      </div>
      <div class="text-lg font-bold">
        历史记录
      </div>
      <div class="flex flex-col">
        <nut-cell-group class="overflow-auto">
          <nut-cell v-for="history in histories" :key="history.id" >
            <div class="flex gap-1 items-center w-full">
              <div class="text-lg">
                {{ Math.ceil(history.duration / 60) }} 分钟
              </div>
              <div class="text-sm ml-auto">
                {{ dayjs(history.createAt).format('YYYY-MM-DD HH:mm') }}
              </div>
            </div>
          </nut-cell>
        </nut-cell-group>
      </div>
      <div class="pos-absolute bottom-4 right-4">
        <floating-action-button icon="edit" @click="onEdit" />
      </div>
    </div>
  </BaseView>
</template>

<style scoped lang="scss">

</style>
