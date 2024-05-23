<script setup lang="ts">
import { IconPark } from '@icon-park/vue-next/es/all'

defineProps({
  icon: {
    type: String,
    default: 'Plus',
  },
  type: {
    type: String,
    default: 'primary',
  },
})
</script>

<template>
  <nut-button :type="type" class="fab-btn">
    <IconPark :type="icon" size="1.2rem" />
  </nut-button>
</template>

<style lang="scss">
.fab-btn{
  width: 3rem;
  height: 3rem;
}

.i-icon{
  display: flex;
  height: 100%;
}
</style>
