<script lang="ts" setup>
import { computed } from 'vue'
import { HourglassNull, SettingTwo, Stopwatch } from '@icon-park/vue-next'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useWindowSize } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const tabRoute = ['/countdown', '/pomodoro', '/settings']
const active = computed<number>({
  get: () => {
    return tabRoute.indexOf(route.path)
  },
  set: (tab: number) => {
    router.push({ path: tabRoute[tab] })
  },
})

const { height } = useWindowSize()
</script>

<template>
  <BaseView :left-show="false" title="iTime">
    <div class="h-full">
      <el-scrollbar class="w-full" :height="height - 100">
        <div class="p-4">
          <RouterView v-slot="{ Component }">
            <component :is="Component" />
          </RouterView>
        </div>
      </el-scrollbar>

      <nut-tabbar v-model="active" bottom safe-area-inset-bottom>
        <!--        <nut-tabbar-item tab-title="待办事项"> -->
        <!--          <template #icon> -->
        <!--            <Check></Check> -->
        <!--          </template> -->
        <!--        </nut-tabbar-item> -->
        <nut-tabbar-item :tab-title="t('countdown.title')">
          <template #icon>
            <HourglassNull />
          </template>
        </nut-tabbar-item>
        <nut-tabbar-item :tab-title="t('pomodoro.title')">
          <template #icon>
            <Stopwatch />
          </template>
        </nut-tabbar-item>
        <nut-tabbar-item :tab-title="t('settings')">
          <template #icon>
            <SettingTwo />
          </template>
        </nut-tabbar-item>
      </nut-tabbar>
    </div>
  </BaseView>
</template>

<style scoped>

</style>
