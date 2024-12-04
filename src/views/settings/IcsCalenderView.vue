<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Check, Copy, Refresh } from '@icon-park/vue-next'
import { showToast } from '@nutui/nutui'
import { useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import BaseView from '@/components/BaseView.vue'
import { ICalendarApi } from '@/api/ICalendarApi'
import { AndroidAppSettingApi } from '@/api/android/AndroidAppSettingApi'
import { AndroidClipboardApi } from '@/api/android/AndroidClipboardApi'

const { t } = useI18n()
const token = useStorage('ics-token', '')
const subscribeLink = ref('')

function getToken() {
  showToast.loading(t('loading'), { id: 'loading' })
  ICalendarApi.get().then((result) => {
    token.value = result
  }).finally(() => {
    showToast.hide('loading')
  })
}

function refreshToken() {
  showToast.loading(t('loading'), { id: 'loading' })
  ICalendarApi.post().then((result) => {
    token.value = result
  }).finally(() => {
    showToast.hide('loading')
  })
}

function subscribe() {
  AndroidAppSettingApi.subscribeICS(subscribeLink.value)
}
getToken()

const link = computed(() => {
  return `https://itime.fun/api/v2/icalendar/${token.value}`
})

function copy() {
  AndroidClipboardApi.copy(link.value)
  showToast.success(t('copied'))
}
</script>

<template>
  <BaseView :title="t('ics.title')">
    <div class="flex flex-col px-2">
      <p>使用说明</p>
      <NutCell>
        {{ t('ics.desc') }}
      </NutCell>
      <nut-form>
        <nut-form-item>
          <div class="flex flex-col gap-2">
            <div>{{ t('ics.exportToLink') }}</div>
            <div class="flex items-center gap-2">
              <NutInput v-model="link" class="h=full" readonly />
              <nut-button size="small" @click="copy">
                <Copy />
              </nut-button>
              <nut-button size="small" @click="refreshToken">
                <Refresh />
              </nut-button>
            </div>
          </div>
        </nut-form-item>
      </nut-form>
      <nut-form>
        <nut-form-item>
          <div class="flex flex-col gap-2">
            <div>{{ t('ics.importFromLink') }}</div>
            <div class="flex items-center">
              <NutInput v-model="subscribeLink" :placeholder="t('ics.importPlaceholder')" class="h=full" />
              <nut-button size="small" @click="subscribe">
                <Check />
              </nut-button>
            </div>
          </div>
        </nut-form-item>
      </nut-form>
    </div>
  </BaseView>
</template>

<style scoped lang="scss">

</style>
