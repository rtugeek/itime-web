<script lang="ts" setup>
import {ref} from 'vue'
import {HourglassNull, Stopwatch, SettingTwo,Check} from '@icon-park/vue-next'
import PomodoroSenceList from '@/widgets/pomodoro/components/PomodoroSenceList.vue'
import Settings from '@/views/settings/Settings.vue'
import CountdownList from '@/views/countdown/CountdownList.vue'
const active = ref(0)
</script>

<template>
  <BaseView :left-show="false" title="iTime">
    <div class="flex flex-col h-full">
      <div class="p-4">
        <CountdownList v-show="active == 0"/>
        <PomodoroSenceList v-show="active == 1"/>
        <Settings v-show="active == 2"/>
      </div>
      <nut-tabbar bottom safe-area-inset-bottom v-model="active">
<!--        <nut-tabbar-item tab-title="代办事项">-->
<!--          <template #icon>-->
<!--            <Check></Check>-->
<!--          </template>-->
<!--        </nut-tabbar-item>-->
        <nut-tabbar-item tab-title="倒计时">
          <template #icon>
            <HourglassNull></HourglassNull>
          </template>
        </nut-tabbar-item>
        <nut-tabbar-item tab-title="番茄钟">
          <template #icon>
            <Stopwatch></Stopwatch>
          </template>
        </nut-tabbar-item>
        <nut-tabbar-item tab-title="设置">
          <template #icon>
            <SettingTwo></SettingTwo>
          </template>
        </nut-tabbar-item>
      </nut-tabbar>
    </div>
  </BaseView>
</template>

<style scoped>

</style>
