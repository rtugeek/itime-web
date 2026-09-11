<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { reactive } from 'vue'
import consola from 'consola'
import BaseView from '@/components/BaseView.vue'
import { CountdownFormat } from '@/common/CountdownFormat'
import { AppUtils } from '@/utils/AppUtils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const id = route.query.id as string
const format = reactive(CountdownFormat.fromString(route.query.format as string))
consola.info('id', id)
const unitKeys = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'] as const
type UnitKey = typeof unitKeys[number]
const formatKeys: Record<UnitKey, 'showYear' | 'showMonth' | 'showWeek' | 'showDay' | 'showHour' | 'showMinute' | 'showSecond' | 'showMillisecond'> = {
  year: 'showYear',
  month: 'showMonth',
  week: 'showWeek',
  day: 'showDay',
  hour: 'showHour',
  minute: 'showMinute',
  second: 'showSecond',
  millisecond: 'showMillisecond',
}
function save() {
  consola.info('save', format)
  localStorage.setItem(`countdown-format-${id}`, format.toString())
  AppUtils.back(router)
}
</script>

<template>
  <BaseView :title="t('countdown.formatUnit.title')">
    <div class="flex flex-col p-4 space-y-3">
      <div
        v-for="key in unitKeys" :key="key" class="flex items-center justify-between px-4 py-3 border-b border-border"
      >
        <Label class="text-base">
          {{ t(`countdown.formatUnit.${key}`) }}
        </Label>
        <Switch v-model="format[formatKeys[key]]" />
      </div>
      <Button class="w-full mt-4" @click="save">
        {{ t('save') }}
      </Button>
    </div>
  </BaseView>
</template>

<style scoped lang="scss">

</style>
