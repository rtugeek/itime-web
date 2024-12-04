<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus } from '@icon-park/vue-next'
import type { PomodoroHistory } from '@/data/PomodoroHistory'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'
import BaseLayout from '@/components/layout/BaseLayout.vue'
import FloatingActionButton from '@/components/FloatingActionButton.vue'

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
  <BaseLayout :title="t('pomodoro.history.title')">
    <div class="flex flex-col">
      <nut-cell-group class="overflow-auto" />
    </div>
  </BaseLayout>
  <div class="pos-absolute right-6 bottom-18">
    <FloatingActionButton>
      <Plus size="24" />
    </FloatingActionButton>
  </div>
</template>

<style scoped lang="scss">
</style>
