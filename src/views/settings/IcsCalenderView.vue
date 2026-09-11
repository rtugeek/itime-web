<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Copy, Refresh } from '@icon-park/vue-next'
import { toast } from 'vue-sonner'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import BaseView from '@/components/BaseView.vue'
import { ICalendarApi } from '@/api/ICalendarApi'
import { Item, ItemGroup } from '@/components/ui/item'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const { t } = useI18n()
const token = useStorage('ics-token', '')

function getToken() {
  const loadingId = toast.loading(t('loading'))
  ICalendarApi.get().then((result) => {
    token.value = result
  }).finally(() => {
    toast.dismiss(loadingId)
  })
}

function refreshToken() {
  const loadingId = toast.loading(t('loading'))
  ICalendarApi.post().then((result) => {
    token.value = result
  }).finally(() => {
    toast.dismiss(loadingId)
  })
}

getToken()

const link = computed(() => {
  return `https://itime.fun/api/v2/icalendar/${token.value}`
})

function copy() {
  navigator.clipboard.writeText(link.value).then(() => {
    toast.success(t('copied'))
  }).catch(() => {
    toast.error(t('copyFailed'))
  })
}
</script>

<template>
  <BaseView :title="t('ics.title')">
    <div class="flex flex-col px-2 gap-4">
      <div>
        <p class="mb-2 font-medium">
          使用说明
        </p>
        <ItemGroup>
          <Item variant="outline">
            {{ t('ics.desc') }}
          </Item>
        </ItemGroup>
      </div>
      <div class="flex flex-col gap-2">
        <Label>{{ t('ics.exportToLink') }}</Label>
        <div class="flex items-center gap-2">
          <Input v-model="link" readonly class="flex-1" />
          <Button size="icon" variant="outline" @click="copy">
            <Copy class="size-4" />
          </Button>
          <Button size="icon" variant="outline" @click="refreshToken">
            <Refresh class="size-4" />
          </Button>
        </div>
      </div>
    </div>
  </BaseView>
</template>

<style scoped lang="scss">

</style>
