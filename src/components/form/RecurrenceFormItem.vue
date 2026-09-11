<script setup lang="ts">
import { ChevronDown, Repeat2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import NutRecurrentPicker from '@/components/NutRecurrentPicker.vue'
import { RRuleUtils } from '@/utils/RRuleUtils'
import { Button } from '@/components/ui/button'

const { t } = useI18n()
const model = defineModel<string>()
const showRRulePicker = ref(false)
const rruleTxt = computed(() => RRuleUtils.toString(model.value))
</script>

<template>
  <div class="flex min-w-0 flex-col gap-2.5">
    <div class="flex items-center gap-2 text-sm font-medium leading-none">
      <Repeat2 class="size-4 text-muted-foreground" />
      {{ t('recurrence.title') }}
    </div>
    <Button type="button" variant="outline" class="w-full min-w-0 justify-between px-3 font-normal" :aria-label="`${t('recurrence.title')}: ${rruleTxt || t('recurrence.none')}`" @click="showRRulePicker = true">
      <span class="truncate">{{ rruleTxt || t('recurrence.none') }}</span>
      <ChevronDown class="size-4 shrink-0 text-muted-foreground" />
    </Button>
    <NutRecurrentPicker v-model="showRRulePicker" v-model:rrule="model" />
  </div>
</template>

<style scoped lang="scss">
</style>
