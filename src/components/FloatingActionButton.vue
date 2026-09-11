<script setup lang="ts">
import { Check } from '@icon-park/vue-next'
import type { PropType } from 'vue'
import { Button } from '@/components/ui/button'

defineProps({
  icon: {
    type: String,
    default: 'Plus',
  },
  variant: {
    type: String as PropType<'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'>,
    default: 'default',
  },
  type: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <Button :variant="type === 'danger' ? 'destructive' : variant" size="icon" class="fab-btn">
    <slot>
      <Check size="24" />
    </slot>
  </Button>
</template>

<style scoped lang="scss">
.fab-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
}
</style>
