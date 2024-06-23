<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import dayjs from 'dayjs'
import { PomodoroUtils } from '../../utils/PomodoroUtils'
import type { PomodoroScene } from '@/data/PomodoroScene'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'
import PomodoroDetailBlock from '@/views/pomodoro/PomodoroDetailBlock.vue'
import { PomodoroRepository } from '@/data/repository/PomodoroRepository'

const route = useRoute()
const router = useRouter()
const id = route.query.id as string
const scene = ref<PomodoroScene>()
const checkInDayCount = ref(0)
const count = ref(0)

PomodoroSceneRepository.get(id).then(async (res) => {
  if (res) {
    scene.value = res
    const history = await PomodoroRepository.findBySceneId(scene.value.id!)
    const date = new Set<string>()
    history.forEach((history) => {
      date.add(dayjs(history.finishAt).format('YYYY-MM-DD'))
    })
    checkInDayCount.value = date.size
    count.value = history.length
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
    <div class="flex flex-col gap-2 p-2">
      <div class="flex gap-2">
        <PomodoroDetailBlock title="累计时长" :content="PomodoroUtils.getTotalHour(scene)" unit="小时" />
        <PomodoroDetailBlock title="打卡天数" :content="checkInDayCount" unit="天" />
        <PomodoroDetailBlock title="总记录数" :content="count" unit="个" />
      </div>
    </div>
    <div class="pos-absolute bottom-4 right-4">
      <floating-action-button icon="edit" @click="onEdit" />
    </div>
  </BaseView>
</template>

<style scoped lang="scss">

</style>
