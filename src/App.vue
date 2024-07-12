<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView v-slot="{ Component }">
    <component :is="Component" />
  </RouterView>
</template>

<style>
html {
  font-size: var(--widget-font-size);
  font-family: var(--widget-font-family);
}
body{
  overflow: hidden;
}
</style>
