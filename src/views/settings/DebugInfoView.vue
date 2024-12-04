<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { showToast } from '@nutui/nutui'
import BaseView from '@/components/BaseView.vue'
import { AndroidApi } from '@/api/android/AndroidApi'
import { AndroidClipboardApi } from '@/api/android/AndroidClipboardApi'

const info = AndroidApi.getDebugInfo()
const keys = Object.keys(info)
const { t } = useI18n()
function copy() {
  AndroidClipboardApi.copy(JSON.stringify(info, null, 2))
  showToast.success(t('copied'))
}
</script>

<template>
  <BaseView :title="t('debug.title')">
    <div class="flex flex-col p-2">
      <NutCellGroup>
        <NutCell v-for="key in keys" :key="key">
          <template #title>
            {{ key }}
          </template>
          <template #desc>
            {{ info[key] }}
          </template>
        </NutCell>
      </NutCellGroup>
      <NutButton @click="copy">
        {{ t('copy') }}
      </NutButton>
    </div>
  </BaseView>
</template>

<style scoped lang="scss">

</style>
