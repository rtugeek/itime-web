<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { Badge } from '@/components/ui/badge'
import { ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { PomodoroUtils } from '@/utils/PomodoroUtils'
import { usePomodoroStore } from '@/stores/usePomodoroStore'
import type { IPomodoroScene } from '@/data/PomodoroScene'
import type { PomodoroHistory } from '@/data/PomodoroHistory'

const prop = defineProps({
  scene: {
    type: Object as PropType<IPomodoroScene>,
    required: true,
  },
})
const { t } = useI18n()
const pomodoroStore = usePomodoroStore()
const histories = ref<PomodoroHistory[]>([])
async function loadHistories() {
  histories.value = await pomodoroStore.findHistoryBySceneId(prop.scene.id!)
}
void loadHistories()
watch(() => pomodoroStore.dataRevision, loadHistories)
const totalDuration = computed(() => {
  return PomodoroUtils.getTotalHour(histories.value)
})
</script>

<template>
  <ItemMedia variant="icon" class="bg-muted text-xl">
    <span aria-hidden="true">{{ scene.icon }}</span>
  </ItemMedia>
  <ItemContent class="min-w-0">
    <ItemTitle class="block max-w-full truncate">
      {{ scene.name }}
    </ItemTitle>
  </ItemContent>
  <ItemActions class="ml-auto shrink-0">
    <Badge variant="secondary" class="text-md tabular-nums" :aria-label="`累计专注 ${totalDuration.toFixed(1)} ${t('unit.hour', totalDuration)}`">
      {{ totalDuration.toFixed(1) }} {{ t('unit.hour', totalDuration) }}
    </Badge>
    <ChevronRight class="size-4 text-muted-foreground" aria-hidden="true" />
  </ItemActions>
</template>
