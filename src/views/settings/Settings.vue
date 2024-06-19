<script setup lang="ts">
import PomodoroSettings from '@/views/settings/PomodoroSettings.vue'
import { User } from '@icon-park/vue-next'
</script>

<template>
  <div class="flex flex-col">
    <NutCell>
      <div class="flex gap-2 items-center">
        <nut-avatar shape="round"><User /></nut-avatar>
        未登录
      </div>
    </NutCell>
    番茄钟设置
    <PomodoroSettings/>
  </div>
</template>

<style scoped lang="scss">

</style>
