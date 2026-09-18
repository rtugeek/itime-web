<script setup lang="ts">
import { RefreshCw } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/useUserStore'

defineProps<{ busy: boolean, error?: string }>()
defineEmits<{ sync: [] }>()
const userStore = useUserStore()
</script>

<template>
  <div v-if="userStore.isLogin" class="flex flex-col items-end gap-2">
    <Button variant="outline" :disabled="busy" @click="$emit('sync')">
      <RefreshCw class="size-4" :class="{ 'animate-spin': busy }" />{{ busy ? '同步中…' : '同步' }}
    </Button>
    <p v-if="error" role="alert" class="max-w-sm text-sm text-destructive">
      {{ error }}
    </p>
  </div>
</template>
