<script setup lang="ts">
import { User } from '@icon-park/vue-next'
import { WindowUtils } from '@/utils/WindowUtils'

function click() {
  WindowUtils.open('/settings')
}
</script>

<template>
  <User class="icon" @click="click" />
</template>

<style scoped lang="scss">
.icon{
  transform: scale(0.9);
}
</style>
