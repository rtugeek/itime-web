<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import { PomodoroUtils } from '../../utils/PomodoroUtils'
import type { PomodoroScene } from '@/data/PomodoroScene'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'

const route = useRoute()
const router = useRouter()
const id = route.query.id as string
const scene = ref<PomodoroScene>()
PomodoroSceneRepository.get(id).then((res) => {
  if (res) {
    scene.value = res
  }
  else {
    router.back()
  }
})
</script>

<template>
  <BaseView v-if="scene" :title="`${scene.icon} ${scene.name}`" class="detail-root">
    <div class="flex flex-col gap-2 p-2">
      <div class="flex gap-2">
        <nut-cell>
          <div class="block">
            <div class="title">
              累计时长
            </div>
            <div class="content font-bold text-2xl">
              {{ PomodoroUtils.getTotalHour(scene) }}
            </div>
            <div class="unit">
              小时
            </div>
          </div>
        </nut-cell>
        <nut-cell>
          <div class="title">
            打卡天数
          </div>
        </nut-cell>
        <nut-cell>
          <div class="title">
            总记录数
          </div>
        </nut-cell>
      </div>
    </div>
  </BaseView>
</template>

<style scoped lang="scss">
$text-color: #494644;
.nut-cell{
  color: $text-color;
  .block{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    margin: auto;
    .title,.unit{
      font-size: 12px;
    }
  }
}
</style>
