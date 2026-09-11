<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { type PomodoroSettings, getDefaultPomodoroSettings } from '@/data/PomodoroSettings'
import { AppConfig } from '@/common/AppConfig'
import { Item, ItemContent, ItemGroup, ItemSeparator, ItemTitle } from '@/components/ui/item'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

const pomoSettings = useStorage<PomodoroSettings>(AppConfig.KEY_POMODORO_SETTINGS, getDefaultPomodoroSettings())
const { t } = useI18n()

function clampValue(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

function adjustNumber(target: 'pomoTime' | 'shortBreakTime', delta: number) {
  const isPomo = target === 'pomoTime'
  const min = isPomo ? 5 : 1
  const max = isPomo ? 60 : 30
  pomoSettings.value[target] = clampValue(Number(pomoSettings.value[target]) + delta, min, max)
}
</script>

<template>
  <ItemGroup>
    <Item variant="muted">
      <ItemContent>
        <div class="flex items-center justify-between w-full gap-4">
          <div class="flex flex-col gap-1">
            <ItemTitle>{{ t('pomodoro.time', { time: pomoSettings.pomoTime }) }}</ItemTitle>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <Button
              variant="outline"
              size="icon-xs"
              @click="adjustNumber('pomoTime', -1)"
            >
              -
            </Button>
            <Input
              v-model="pomoSettings.pomoTime"
              type="number"
              :min="5"
              :max="60"
              class="w-20 text-center"
            />
            <Button
              variant="outline"
              size="icon-xs"
              @click="adjustNumber('pomoTime', 1)"
            >
              +
            </Button>
          </div>
        </div>
      </ItemContent>
    </Item>
    <ItemSeparator />
    <Item variant="muted">
      <ItemContent>
        <div class="flex items-center justify-between w-full gap-4">
          <div class="flex flex-col gap-1">
            <ItemTitle>{{ t('pomodoro.shortBreakTime', { time: pomoSettings.shortBreakTime }) }}</ItemTitle>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <Button
              variant="outline"
              size="icon-xs"
              @click="adjustNumber('shortBreakTime', -1)"
            >
              -
            </Button>
            <Input
              v-model="pomoSettings.shortBreakTime"
              type="number"
              :min="1"
              :max="30"
              class="w-20 text-center"
            />
            <Button
              variant="outline"
              size="icon-xs"
              @click="adjustNumber('shortBreakTime', 1)"
            >
              +
            </Button>
          </div>
        </div>
      </ItemContent>
    </Item>
    <ItemSeparator />
    <Item variant="muted">
      <ItemContent>
        <div class="flex items-center justify-between w-full gap-4">
          <div class="flex flex-col gap-1 w-60">
            <ItemTitle>{{ t('pomodoro.autoStart') }}</ItemTitle>
          </div>
          <div class="shrink-0">
            <Switch v-model:checked="pomoSettings.isAutoNext" />
          </div>
        </div>
      </ItemContent>
    </Item>
  </ItemGroup>
</template>

<style scoped lang="scss">
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
