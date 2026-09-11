<script setup lang="ts">
import { ColorPicker } from 'vue3-colorpicker'
import { Input } from '@/components/ui/input'
import { InputGroup } from '@/components/ui/input-group'

const modelValue = defineModel({ type: String })
</script>

<template>
  <InputGroup>
    <Input v-model="modelValue" readonly class="pr-12" />
    <div class="absolute right-2 top-1/2 -translate-y-1/2">
      <ColorPicker v-model:pure-color="modelValue" format="hex8" shape="circle" round-history />
    </div>
  </InputGroup>
</template>

<style scoped lang="scss">
:deep(.input-group) {
  position: relative;
}
</style>
