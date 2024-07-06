<script setup lang="ts">
import { ColorPicker } from 'vue3-colorpicker'

const modelValue = defineModel({ type: String })
</script>

<template>
  <NutInput v-model="modelValue" readonly>
    <template #right>
      <ColorPicker v-model:pureColor="modelValue" format="hex8" shape="circle" round-history />
    </template>
  </NutInput>
</template>

<style scoped lang="scss">

</style>
