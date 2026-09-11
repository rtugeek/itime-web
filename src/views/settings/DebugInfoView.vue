<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { computed } from 'vue'
import BaseView from '@/components/BaseView.vue'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { Button } from '@/components/ui/button'

const { t } = useI18n()

type DebugInfo = Record<string, string | number | boolean>
const info = computed<DebugInfo>(() => ({
  userAgent: navigator.userAgent,
  language: navigator.language,
  platform: navigator.platform,
  appVersion: navigator.appVersion,
  vendor: navigator.vendor,
  cookieEnabled: navigator.cookieEnabled,
  online: navigator.onLine,
  screenWidth: window.screen.width,
  screenHeight: window.screen.height,
  viewportWidth: window.innerWidth,
  viewportHeight: window.innerHeight,
  devicePixelRatio: window.devicePixelRatio,
  localStorageSize: JSON.stringify(localStorage).length,
  localStorageKeys: Object.keys(localStorage).join(', '),
}))

const keys = computed(() => Object.keys(info.value))

function copy() {
  navigator.clipboard.writeText(JSON.stringify(info.value, null, 2)).then(() => {
    toast.success(t('copied'))
  }).catch(() => {
    toast.error(t('copyFailed'))
  })
}
</script>

<template>
  <BaseView :title="t('debug.title')">
    <div class="flex flex-col p-2 gap-4">
      <ItemGroup class="gap-1">
        <Item v-for="key in keys" :key="key" variant="outline">
          <ItemContent>
            <ItemTitle>{{ key }}</ItemTitle>
            <ItemDescription class="break-all">
              {{ info[key] }}
            </ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
      <Button class="w-full" @click="copy">
        {{ t('copy') }}
      </Button>
    </div>
  </BaseView>
</template>

<style scoped lang="scss">

</style>
