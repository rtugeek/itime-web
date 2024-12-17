<script setup lang="ts">
import { Close } from '@icon-park/vue-next'
import { type PropType, computed } from 'vue'
import type { Solar } from 'lunar-typescript'
import type { Almanac } from '@/api/PublicEventApi'

const props = defineProps({
  almanac: {
    type: Object as PropType<Almanac>,
  },
  solar: {
    type: Object as PropType<Solar>,
    required: true,
  },
})

const show = defineModel<boolean>()

function closeWindow() {
  show.value = false
}

const lunar = computed(() => {
  return props.solar.getLunar()
})
</script>

<template>
  <div v-if="solar" v-show="show" class="almanac flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-xl p-4 relative wrapper">
      <div class="cursor-pointer absolute top-4 right-4 text-gray-500 hover:text-gray-700 !rounded-button" @click="closeWindow">
        <Close />
      </div>
      <div class="text-center text-gray-600 flex items-center flex-col gap-2 mb-3">
        <div class="text-2xl  font-bold">
          {{ solar.getYear() }}年{{ solar.getMonth() }}月{{ solar.getDay() }}日
        </div>
        <div class="text-gray-600">
          {{ lunar.toString() }}
        </div>
        <div class="flex items-center gap-2">
          <div class="tag">
            {{ solar.getXingZuo() }}
          </div>
          <div class="tag">
            周{{ solar.getWeekInChinese() }}
          </div>
        </div>
      </div>

      <div v-if="almanac" class="flex flex-col gap-2">
        <div class="bg-green-50 p-2 rounded-lg">
          <div class="text-green-600 font-medium mb-2">
            宜
          </div>
          <div class="text-gray-600 text-sm">
            {{ almanac.suit }}
          </div>
        </div>
        <div class="bg-red-50 p-2 rounded-lg">
          <div class="text-red-600 font-medium mb-2">
            忌
          </div>
          <div class="text-gray-600 text-sm">
            {{ almanac.avoid }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.almanac{
  background-color: rgba(0, 0, 0, .55);
  border-radius: var(--widget-border-radius);
  z-index: 1;
  position: absolute;
  width: var(--widget-inner-width);
  height: var(--widget-inner-height);
  .wrapper{
    width: 70%;
  }
  .tag{
    border-radius: 4px;
    padding: 2px 4px;
    background-color: #f3f4f6;
    color: #6b7280;
  }
}
</style>
