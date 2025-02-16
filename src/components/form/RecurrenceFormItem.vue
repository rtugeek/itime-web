<script setup lang="ts">
import { PlayCycle } from '@icon-park/vue-next'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import NutRecurrentPicker from '@/components/NutRecurrentPicker.vue'
import { RRuleUtils } from '@/utils/RRuleUtils'

const { t } = useI18n()
const model = defineModel<string>()
const showRRulePicker = ref(false)
const rruleTxt = computed(() => RRuleUtils.toString(model.value))
</script>

<template>
  <nut-form-item :label-width="30" label-align="center" @click="showRRulePicker = true">
    <nut-input
      v-model="rruleTxt" readonly class="w-full cursor-pointer" :placeholder="t('recurrence.title')"
      @click="showRRulePicker = true"
    >
      <template #left>
        <PlayCycle />
      </template>
    </nut-input>
    <NutRecurrentPicker v-model="showRRulePicker" v-model:rrule="model" />
  </nut-form-item>
</template>

<style scoped lang="scss">

</style>
