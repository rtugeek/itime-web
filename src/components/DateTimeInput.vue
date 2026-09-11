<script setup lang="ts">
import { computed } from 'vue'
import DatePicker from '@/components/DatePicker.vue'
import TimePicker from '@/components/TimePicker.vue'

const props = defineProps<{
  id?: string
  class?: string
  placeholder?: string
  disabled?: boolean
  minDate?: Date | string
  maxDate?: Date | string
}>()

const model = defineModel<Date>({ default: new Date() })

const dateModel = computed({
  get: () => model.value,
  set: (val: Date | undefined) => {
    if (val) {
      const newDate = new Date(model.value || new Date())
      newDate.setFullYear(val.getFullYear(), val.getMonth(), val.getDate())
      model.value = newDate
    }
  },
})

const timeModel = computed({
  get: () => model.value,
  set: (val: Date | undefined) => {
    if (val) {
      const newDate = new Date(model.value || new Date())
      newDate.setHours(val.getHours(), val.getMinutes(), 0, 0)
      model.value = newDate
    }
  },
})
</script>

<template>
  <div class="flex items-stretch gap-2 w-full">
    <DatePicker
      :id="id ? `${id}-date` : undefined"
      v-model="dateModel"
      :class="props.class"
      :disabled="disabled"
      :min-date="minDate"
      :max-date="maxDate"
      class="flex-1"
    />
    <TimePicker
      :id="id ? `${id}-time` : undefined"
      v-model="timeModel"
      :disabled="disabled"
      class="flex-1"
    />
  </div>
</template>

<style scoped lang="scss">
</style>
