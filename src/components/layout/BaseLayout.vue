<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <BaseView :title="route.meta.title">
    <div class="h-full">
      <RouterView v-slot="{ Component }">
        <component :is="Component" />
      </RouterView>
    </div>
  </BaseView>
</template>

<style scoped lang="scss">

</style>
