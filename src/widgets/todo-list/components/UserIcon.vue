<script setup lang="ts">
import { Refresh, RightUser, User } from '@icon-park/vue-next'
import { storeToRefs } from 'pinia'
import { AppApi } from '@widget-js/core'
import { useTodoStore } from '@/stores/useTodoStore'
import { useSupabaseStore } from '@/stores/useSupabaseStore'

function click() {
  AppApi.showAppWindow('/user/profile', { width: 400, height: 500 })
}

const todoStore = useTodoStore()
const { syncing } = storeToRefs(todoStore)
const supabaseStore = useSupabaseStore()
const { isLogin } = storeToRefs(supabaseStore)
</script>

<template>
  <Refresh v-if="syncing" class="icon spin" />
  <template v-if="!syncing">
    <RightUser v-if="isLogin" class="icon" @click="click" />
    <User v-else class="icon" @click="click" />
  </template>
</template>

<style scoped lang="scss">
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: scale(0.9) rotate(0deg);
  }
  to {
    transform: scale(0.9) rotate(360deg);
  }
}
</style>
