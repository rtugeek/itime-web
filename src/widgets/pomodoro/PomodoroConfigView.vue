<script lang="ts" setup>
import { BrowserWindowApi } from '@widget-js/core'
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { type PomodoroSettings, getDefaultPomodoroSettings } from '@/data/PomodoroSettings'
import { AppConfig } from '@/common/AppConfig'
import PomodoroSenceList from '@/widgets/pomodoro/components/PomodoroSenceList.vue'

const pomoSettings = useStorage<PomodoroSettings>(AppConfig.KEY_POMODORO_SETTINGS, getDefaultPomodoroSettings())

const selectTab = ref('1')

BrowserWindowApi.setup({
  width: 400,
  height: 700,
})
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
        <nut-form>
          <nut-form-item label-width="130px" :label="`番茄时长（${pomoSettings.pomoTime}m）`">
            <nut-input-number v-model="pomoSettings.pomoTime" :min="5" :max="60" type="text" />
          </nut-form-item>
          <nut-form-item label-width="130px" :label="`休息时长（${pomoSettings.shortBreakTime}m）`">
            <nut-input-number v-model="pomoSettings.shortBreakTime" :min="1" :max="30" type="text" />
          </nut-form-item>
        </nut-form>
      </nut-tab-pane>
      <nut-tab-pane title="主题设置" pane-key="3">
        Content 2
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
