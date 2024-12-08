<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, ref } from 'vue'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { PomodoroUtils } from '@/utils/PomodoroUtils'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'
import type { PomodoroScene } from '@/data/PomodoroScene'
import type { PomodoroHistory } from '@/data/PomodoroHistory'

const prop = defineProps({
  scene: {
    type: Object as PropType<PomodoroScene>,
    required: true,
  },
})
const { t } = useI18n()
const histories = ref<PomodoroHistory[]>([])
PomodoroHistoryRepository.findBySceneId(prop.scene.id!).then((his) => {
  histories.value = his
})
const totalDuration = computed(() => {
  return PomodoroUtils.getTotalHour(histories.value)
})
</script>

<template>
  <div class="flex gap-2">
    <div>{{ scene.icon }}</div>
    <div>{{ scene.name }}</div>
  </div>
  <div class="ml-auto">
    {{ totalDuration.toFixed(1) }} {{ t('unit.hour', totalDuration) }}
  </div>
</template>

<style scoped lang="scss">

</style>
