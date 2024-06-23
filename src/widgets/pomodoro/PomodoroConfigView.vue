<script lang="ts" setup>
import { ref } from 'vue'
import PomodoroSenceList from '@/widgets/pomodoro/components/PomodoroSenceList.vue'
import PomodoroSettings from '@/views/settings/PomodoroSettings.vue'

const selectTab = ref('1')
</script>

<template>
  <base-view title="组件设置" :left-show="false">
    <nut-tabs v-model="selectTab" class="tabs" type="smile">
      <nut-tab-pane title="场景" pane-key="1" class="h-full">
        <div class="h-full">
          <PomodoroSenceList />
          <router-link to="/pomodoro/add">
            <FloatingActionButton class="fixed-right-bottom" icon="plus" />
          </router-link>
        </div>
      </nut-tab-pane>
      <nut-tab-pane title="番茄钟设置" pane-key="2">
        <PomodoroSettings />
      </nut-tab-pane>
    </nut-tabs>
  </base-view>
</template>

<style lang="scss">
@use '@/assets/common';

.tabs {
  height: 100%;
  .nut-tabs__titles{
    background-color: common.$backgroundColor;
  }
  .nut-tabs__content {
    height: 100%;
    .nut-tab-pane{
      background-color: common.$backgroundColor;
    }
  }
}
</style>
