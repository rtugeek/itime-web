<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { reactive } from 'vue'
import consola from 'consola'
import BaseView from '@/components/BaseView.vue'
import { AndroidMomentRepository } from '@/data/repository/android/AndroidMomentRepository'
import { CountdownFormat } from '@/common/CountdownFormat'
import { AppUtils } from '@/utils/AppUtils'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const id = route.query.id as string
const format = reactive(CountdownFormat.fromString(route.query.format as string))
consola.info('id', id)
const units: Record<string, string> = {
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
  AndroidMomentRepository.saveCountdownFormat(id, format.toString())
  AppUtils.back(router)
}
</script>

<template>
  <BaseView :title="t('countdown.formatUnit.title')">
    <div class="flex flex-col p-2">
      <NutCellGroup>
        <NutCell v-for="key in Object.keys(units)" :key="key">
          <template #title>
            <div class="flex items-center h-full">
              {{ t(`countdown.formatUnit.${key}`) }}
            </div>
          </template>
          <template #desc>
            <el-switch v-model="format[units[key]]" />
          </template>
        </NutCell>
      </NutCellGroup>
      <NutButton type="primary" @click="save">
        {{ t('save') }}
      </NutButton>
    </div>
  </BaseView>
</template>

<style scoped lang="scss">

</style>
