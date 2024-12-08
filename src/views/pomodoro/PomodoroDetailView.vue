<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { showNotify } from '@nutui/nutui'
import { useI18n } from 'vue-i18n'
import { PomodoroUtils } from '@/utils/PomodoroUtils'
import type { PomodoroScene } from '@/data/PomodoroScene'
import PomodoroDetailBlock from '@/views/pomodoro/PomodoroDetailBlock.vue'
import { usePomodoroHistoryStore } from '@/stores/usePomodoroHistoryStore'
import { usePomodoroSceneStore } from '@/stores/usePomodoroSceneStore'
import type { PomodoroHistory } from '@/data/PomodoroHistory'

const route = useRoute()
const router = useRouter()
const id = Number.parseInt(route.query.id as string)
const scene = ref<PomodoroScene>()
const histories = ref<PomodoroHistory[]>([])
const checkInDayCount = ref(0)
const count = ref(0)
const { t } = useI18n()
const pomodoroHistory = usePomodoroHistoryStore()
const pomodoroSceneStore = usePomodoroSceneStore()
pomodoroSceneStore.findById(id).then((data) => {
  if (data) {
    scene.value = data
    pomodoroHistory.findBySceneId(id).then((his) => {
      histories.value = his.sort((a, b) => dayjs(b.startTime).valueOf() - dayjs(a.startTime).valueOf())
      const date = new Set<string>()
      his.forEach((history) => {
        date.add(dayjs(history.startTime).format('YYYY-MM-DD'))
      })
      checkInDayCount.value = date.size
      count.value = histories.value.length
    })
  }
  else {
    showNotify.warn('Scene not found')
    // router.back()
  }
})

function onEdit() {
  router.push({ name: 'AddPomodoroSceneView', query: { id } })
}

const total = computed(() => {
  return PomodoroUtils.getTotalHourStr(histories.value)
})
</script>

<template>
  <BaseView v-if="scene" :title="`${scene.icon} ${scene.name}`" class="detail-root">
    <div class="flex flex-col gap-2 p-2 overflow-auto">
      <div class="flex gap-2">
        <PomodoroDetailBlock :title="t('pomodoro.totalDuration')" :content="total" :unit="t('unit.hour', total)" />
        <PomodoroDetailBlock :title="t('pomodoro.checkInDays')" :content="checkInDayCount" :unit="t('unit.day', checkInDayCount)" />
        <PomodoroDetailBlock :title="t('pomodoro.records')" :content="count" :unit="t('unit.line', count)" />
      </div>
      <div class="text-lg font-bold">
        {{ t('pomodoro.history.title') }}
      </div>
      <div class="flex flex-col">
        <nut-cell-group class="overflow-auto">
          <nut-cell v-for="history in histories" :key="history.id">
            <div class="flex gap-1 items-center w-full">
              <div class="text-lg">
                {{ Math.ceil(history.duration / 60) }} 分钟
              </div>
              <div class="text-sm ml-auto">
                {{ dayjs(history.startTime).format('YYYY-MM-DD HH:mm') }}
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
