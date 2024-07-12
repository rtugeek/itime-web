<script setup lang="ts">
import PomodoroSceneList from '@/widgets/pomodoro/components/PomodoroSceneList.vue'
</script>

<template>
  <div class="flex h-full">
    <PomodoroSceneList />
    <div class="pos-absolute right-6 bottom-18">
      <router-link :to="{ name: 'AddPomodoroSceneView' }">
        <floating-action-button />
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
