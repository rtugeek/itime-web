<script lang="ts" setup>
import { ref } from 'vue'
import { HourglassNull, SettingTwo, Stopwatch } from '@icon-park/vue-next'
import { useRoute } from 'vue-router'
import PomodoroSceneList from '@/widgets/pomodoro/components/PomodoroSceneList.vue'
import Settings from '@/views/settings/Settings.vue'
import CountdownList from '@/views/countdown/CountdownList.vue'

const route = useRoute()
const active = ref(0)

if (route.query.tab == 'countdown') {
  active.value = 0
}
if (route.query.tab == 'pomodoro') {
  active.value = 1
}
</script>

<template>
  <BaseView :left-show="false" title="iTime">
    <div class="flex flex-col h-full">
      <div class="p-4">
        <CountdownList v-show="active == 0" />
        <PomodoroSceneList v-show="active == 1" />
        <Settings v-show="active == 2" />
      </div>
      <nut-tabbar v-model="active" bottom safe-area-inset-bottom>
        <!--        <nut-tabbar-item tab-title="代办事项"> -->
        <!--          <template #icon> -->
        <!--            <Check></Check> -->
        <!--          </template> -->
        <!--        </nut-tabbar-item> -->
        <nut-tabbar-item tab-title="倒计时">
          <template #icon>
            <HourglassNull />
          </template>
        </nut-tabbar-item>
        <nut-tabbar-item tab-title="番茄钟">
          <template #icon>
            <Stopwatch />
          </template>
        </nut-tabbar-item>
        <nut-tabbar-item tab-title="设置">
          <template #icon>
            <SettingTwo />
          </template>
        </nut-tabbar-item>
      </nut-tabbar>
    </div>
  </BaseView>
</template>

<style scoped>

</style>
