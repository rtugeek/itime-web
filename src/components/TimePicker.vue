<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Clock } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const props = defineProps<{
  id?: string
  class?: HTMLAttributes['class']
  placeholder?: string
  disabled?: boolean
}>()

const model = defineModel<Date>()
const open = ref(false)
const { locale } = useI18n()

const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = Array.from({ length: 60 }, (_, i) => i)

const selectedHour = ref(0)
const selectedMinute = ref(0)

const placeholderText = computed(() => props.placeholder ?? (locale.value.startsWith('zh') ? '选择时间' : 'Pick a time'))

const timeText = computed(() => model.value
  ? `${String(model.value.getHours()).padStart(2, '0')}:${String(model.value.getMinutes()).padStart(2, '0')}`
  : placeholderText.value)

function openPopover() {
  if (model.value) {
    selectedHour.value = model.value.getHours()
    selectedMinute.value = model.value.getMinutes()
  }
  else {
    selectedHour.value = 0
    selectedMinute.value = 0
  }
  open.value = true
}

function confirm() {
  const base = model.value ? new Date(model.value) : new Date()
  base.setHours(selectedHour.value, selectedMinute.value, 0, 0)
  model.value = base
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        :id="id"
        type="button"
        variant="outline"
        :disabled="disabled"
        :class="cn('w-full min-w-0 justify-start gap-2 px-3 text-left font-normal', !model && 'text-muted-foreground', props.class)"
        @click="openPopover"
      >
        <slot name="left">
          <Clock class="size-4 shrink-0 text-muted-foreground" />
        </slot>
        <span class="truncate tabular-nums">{{ timeText }}</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" :side-offset="8" class="rounded-xl p-4 shadow-lg">
      <div class="time-picker-panel">
        <div class="time-picker-fields">
          <div class="time-picker-field">
            <Label class="text-xs font-medium text-muted-foreground">时</Label>
            <NativeSelect v-model="selectedHour" aria-label="时" class="h-11 rounded-lg bg-muted/40 text-base font-medium tabular-nums shadow-none focus-visible:ring-2">
              <NativeSelectOption
                v-for="hour in hours"
                :key="hour"
                :value="hour"
              >
                {{ hour.toString().padStart(2, '0') }}
              </NativeSelectOption>
            </NativeSelect>
          </div>
          <span aria-hidden="true" class="time-picker-separator text-lg font-medium text-muted-foreground">:</span>
          <div class="time-picker-field">
            <Label class="text-xs font-medium text-muted-foreground">分</Label>
            <NativeSelect v-model="selectedMinute" aria-label="分" class="h-11 rounded-lg bg-muted/40 text-base font-medium tabular-nums shadow-none focus-visible:ring-2">
              <NativeSelectOption
                v-for="minute in minutes"
                :key="minute"
                :value="minute"
              >
                {{ minute.toString().padStart(2, '0') }}
              </NativeSelectOption>
            </NativeSelect>
          </div>
        </div>
        <div class="time-picker-actions border-t">
          <Button type="button" variant="outline" class="h-9 rounded-lg shadow-none" @click="open = false">
            取消
          </Button>
          <Button type="button" class="h-9 rounded-lg" @click="confirm">
            确定
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
.time-picker-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.time-picker-fields {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 8px;
}

.time-picker-field {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
}

.time-picker-field :deep([data-slot='native-select-wrapper']) {
  width: 100%;
}

.time-picker-separator {
  display: flex;
  flex: 0 0 16px;
  height: 44px;
  align-items: center;
  justify-content: center;
}

.time-picker-actions {
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding-top: 16px;
}

.time-picker-actions > * {
  flex: 1;
  min-width: 0;
}
</style>
