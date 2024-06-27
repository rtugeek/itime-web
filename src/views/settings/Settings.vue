<script setup lang="ts">
import { User } from '@icon-park/vue-next'
import PomodoroSettings from '@/views/settings/PomodoroSettings.vue'
</script>

<template>
  <div class="flex flex-col">
    <NutCell>
      <div class="flex gap-2 items-center">
        <nut-avatar shape="round">
          <User />
        </nut-avatar>
        数据备份，开发中🔨
      </div>
    </NutCell>
    番茄钟设置
    <PomodoroSettings />
  </div>
</template>

<style scoped lang="scss">

</style>
