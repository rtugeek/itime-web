<script lang="ts" setup>
import { computed } from 'vue'
import { HourglassNull, SettingTwo, Stopwatch } from '@icon-park/vue-next'
import { RouterView, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const tabRoute = ['/countdown', '/pomodoro', '/settings']
const active = computed<number>({
  get: () => {
    return tabRoute.indexOf(route.path)
  },
  set: (tab: number) => {
    router.push({ path: tabRoute[tab] })
  },
})
</script>

<template>
  <BaseView :left-show="false" title="iTime">
    <div class="h-full">
      <div class="p-4">
        <RouterView v-slot="{ Component }">
          <component :is="Component" />
        </RouterView>
      </div>
      <nut-tabbar v-model="active" bottom safe-area-inset-bottom>
        <!--        <nut-tabbar-item tab-title="代办事项"> -->
        <!--          <template #icon> -->
        <!--            <Check></Check> -->
        <!--          </template> -->
        <!--        </nut-tabbar-item> -->
        <nut-tabbar-item tab-title="倒计时">
          <template #icon>
            <HourglassNull />
          </template>
        </nut-tabbar-item>
        <nut-tabbar-item tab-title="番茄钟">
          <template #icon>
            <Stopwatch />
          </template>
        </nut-tabbar-item>
        <nut-tabbar-item tab-title="设置">
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
