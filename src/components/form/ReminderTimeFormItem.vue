<script setup lang="ts">
import { AlarmClock } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import DateTimeInput from '@/components/DateTimeInput.vue'
import { Switch } from '@/components/ui/switch'

const model = defineModel<string>()
const enable = defineModel<boolean>('enable')
const { t, locale } = useI18n()

const minDate = ref(new Date())

const isZh = computed(() => locale.value.startsWith('zh'))
const errorMsg = computed(() => isZh.value ? '提醒时间必须大于当前时间' : 'Reminder time must be later than now')

const dateModel = computed({
  get: () => {
    if (model.value) {
      return dayjs(model.value).toDate()
    }
    return dayjs().add(1, 'hour').minute(0).second(0).toDate()
  },
  set: (val: Date | undefined) => {
    if (!val) {
      model.value = undefined
      return
    }
    if (dayjs(val).isBefore(dayjs())) {
      return
    }
    model.value = val.toISOString()
  },
})

const isInvalid = computed(() => {
  if (!model.value) { return false }
  return dayjs(model.value).isBefore(dayjs())
})

watch(enable, (val) => {
  if (val && !model.value) {
    dateModel.value = dayjs().add(1, 'hour').minute(0).second(0).toDate()
  }
})
</script>

<template>
  <div class="flex min-w-0 flex-col gap-3 rounded-md border border-border bg-muted/30 p-3">
    <div class="flex min-h-6 items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-sm font-medium">
        <AlarmClock class="size-4 text-muted-foreground" />
        {{ t('todo.reminder') }}
      </div>
      <Switch v-model="enable" :aria-label="t('todo.reminder')" />
    </div>
    <div v-if="enable" class="flex flex-col gap-1.5">
      <DateTimeInput
        v-model="dateModel"
        :min-date="minDate"
        class="w-full"
      />
      <p v-if="isInvalid" class="text-xs text-destructive pl-1">
        {{ errorMsg }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
