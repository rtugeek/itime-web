<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RRuleUtils } from '@/utils/RRuleUtils'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const modelValue = defineModel({ type: Boolean, default: false })
const rrule = defineModel('rrule', { type: String, default: '' })

const { t } = useI18n()

const rrules = computed(() => [
  { text: t('recurrence.none'), value: '' },
  { text: t('recurrence.daily'), value: RRuleUtils.DAILY_STR },
  { text: t('recurrence.weekly'), value: RRuleUtils.WEEKLY_STR },
  { text: t('recurrence.monthly'), value: RRuleUtils.MONTHLY_STR },
])

const selectedValue = ref(rrule.value)

watch(() => modelValue.value, (val) => {
  if (val) {
    selectedValue.value = rrule.value
  }
})

function onConfirm() {
  rrule.value = selectedValue.value
  modelValue.value = false
}

function onCancel() {
  modelValue.value = false
}
</script>

<template>
  <Sheet v-model:open="modelValue">
    <SheetContent side="bottom" class="h-auto max-h-[80dvh] gap-0 overflow-hidden rounded-t-xl" :aria-describedby="undefined">
      <SheetHeader class="shrink-0 border-b border-border px-5 py-4 pr-12">
        <SheetTitle class="text-base font-semibold">
          {{ t('recurrence.title') }}
        </SheetTitle>
      </SheetHeader>
      <div class="min-h-0 overflow-y-auto px-5 py-4">
        <RadioGroup v-model="selectedValue" class="gap-2" orientation="vertical" :aria-label="t('recurrence.title')">
          <label
            v-for="item in rrules"
            :key="item.value"
            class="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-3 text-sm transition-colors hover:bg-accent/60"
            :class="selectedValue === item.value ? 'border-primary/30 bg-accent font-medium' : 'border-transparent'"
          >
            <RadioGroupItem :value="item.value" :aria-label="item.text" />
            <span class="min-w-0 leading-5">{{ item.text }}</span>
          </label>
        </RadioGroup>
      </div>
      <SheetFooter class="shrink-0 flex-row justify-end gap-3 border-t border-border bg-muted/30 px-5 py-4">
        <Button type="button" variant="outline" class="h-10 min-w-24" @click="onCancel">
          {{ t('cancel') }}
        </Button>
        <Button type="button" class="h-10 min-w-24" @click="onConfirm">
          {{ t('confirm') }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
