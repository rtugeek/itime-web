<script setup lang="ts">
import { Check } from '@icon-park/vue-next'
import type { PropType } from 'vue'
import type { ButtonType } from '@nutui/nutui'

defineProps({
  icon: {
    type: String,
    default: 'Plus',
  },
  type: {
    type: String as PropType<ButtonType>,
    default: 'primary',
  },
})
</script>

<template>
  <nut-button :type="type" class="fab-btn">
    <slot>
      <Check size="24"/>
    </slot>
  </nut-button>
</template>

<style scoped lang="scss">
.fab-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
}

.i-icon {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
}
</style>
