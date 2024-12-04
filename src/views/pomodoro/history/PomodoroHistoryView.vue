<script setup lang="ts">
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Delete } from '@icon-park/vue-next'
import { showDialog, showToast } from '@nutui/nutui'
import type { PomodoroHistory } from '@/data/PomodoroHistory'
import { PomodoroHistoryRepository } from '@/data/repository/PomodoroHistoryRepository'
import { usePomodoroHistoryStore } from '@/stores/usePomodoroHistoryStore'
import BaseView from '@/components/BaseView.vue'

const route = useRoute()
const { t } = useI18n()
const id = Number.parseInt(route.query.id as string)
const histories = ref<PomodoroHistory[]>()
if (id) {
  PomodoroHistoryRepository.findBySceneId(id).then((his) => {
    histories.value = his
    console.log(histories.value)
  })
}

const pomodoroHistoryStore = usePomodoroHistoryStore()
function deleteHistory(history: PomodoroHistory) {
  // 提示是否删除任务
  showDialog({
    title: t('pomodoro.history.deleteTip'),
    footerDirection: 'vertical',
    onOk: () => {
      showToast.loading(t('deleting'), { id: 'loading' })
      pomodoroHistoryStore.deleteHistory(history).then(() => {
        histories.value = histories.value?.filter(item => item.id !== history.id)
      }).finally(() => {
        showToast.hide('loading')
      })
    },
  })
}
</script>

<template>
  <BaseView :title="t('pomodoro.history.title')">
    <div class="flex flex-col p-4 overflow-auto">
      <nut-cell v-for="history in histories" :key="history.id">
        <div class="flex gap-1 items-center w-full">
          <div class="text-lg">
            {{ Math.ceil(history.duration / 60) }} {{ t('minute') }}
          </div>
          <div class="text-sm ml-auto">
            {{ dayjs(history.startTime).format('YYYY-MM-DD HH:mm') }}
          </div>
          <nut-button class="ml-4" size="small" @click="deleteHistory(history)">
            <Delete />
          </nut-button>
        </div>
      </nut-cell>
    </div>
  </BaseView>
</template>

<style scoped lang="scss">
</style>
