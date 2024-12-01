<script setup lang="ts">
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PomodoroHistory } from '@/data/PomodoroHistory'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'

const route = useRoute()
const { t } = useI18n()
const id = route.query.id as string
const histories = ref<PomodoroHistory[]>()
if (id) {
  PomodoroHistoryRepository.findBySceneId(Number.parseInt(id)).then((his) => {
    histories.value = his
  })
}
</script>

<template>
  <div class="flex flex-col">
    <nut-cell-group class="overflow-auto">
      <nut-cell v-for="history in histories" :key="history.id">
        <div class="flex gap-1 items-center w-full">
          <div class="text-lg">
            {{ Math.ceil(history.duration / 60) }} {{ t('minute') }}
          </div>
          <div class="text-sm ml-auto">
            {{ dayjs(history.createAt).format('YYYY-MM-DD HH:mm') }}
          </div>
        </div>
      </nut-cell>
    </nut-cell-group>
  </div>
</template>

<style scoped lang="scss">
$text-color: #494644;

.nut-cell {
  color: $text-color;

  .block {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    margin: auto;

    .title, .unit {
      font-size: 12px;
    }
  }
}
</style>
