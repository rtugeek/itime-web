<script setup lang="ts">
import { RefreshCw, User, UserCheck } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useTodoStore } from '@/stores/useTodoStore'
import { useUserStore } from '@/stores/useUserStore'

const router = useRouter()
function click() {
  router.push('/user/sign/in')
}

const todoStore = useTodoStore()
const { syncing } = storeToRefs(todoStore)
const userStore = useUserStore()
const { isLogin } = storeToRefs(userStore)
</script>

<template>
  <RefreshCw v-if="syncing" class="icon spin" />
  <template v-if="!syncing">
    <UserCheck v-if="isLogin" class="icon" @click="click" />
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
