<script setup lang="ts">
import { VueScrollPicker } from 'vue-scroll-picker'
import { computed } from 'vue'
import { Check, Close } from '@icon-park/vue-next'
import { storeToRefs } from 'pinia'
import type { ScrollPickerOption } from 'vue-scroll-picker/src/components/picker'
import { usePomodoroSceneStore } from '@/stores/pomodoroSceneStore'

const modelValue = defineModel<string>({ required: true })
const show = defineModel<boolean>('show')
const sceneStore = usePomodoroSceneStore()
const { scenes } = storeToRefs(sceneStore)
const items = computed<ScrollPickerOption[]>(() => {
  return scenes.value.map((it) => {
    return { name: `${it.icon} ${it.name}`, value: it.id }
  })
})

// const pickerModel = computed({
//   get: () => {
//     const scene = scenes.value.find(it => it.id === modelValue.value)!
//     console.log(scene)
//     return {
//       name: `${scene.icon} ${scene.name}`,
//       value: scene.id,
//     }
//   },
//   set: (value: ScrollPickerOption) => {
//     modelValue.value = value.value
//     console.log(value)
//   },
// })
sceneStore.reload()

function close() {
  show.value = false
}

function save() {
  show.value = false
}
</script>

<template>
  <div class="scene-picker">
    <div class="flex text-black fixed widget-w-full p-2 justify-between z-100 box-border">
      <Close class="btn" size="14" @click="close" />
      <Check class="btn" size="14" @click="save" />
    </div>
    <VueScrollPicker v-model="modelValue" :options="items" />
  </div>
</template>

<style scoped lang="scss">
.scene-picker{
  font-size: 16px;
  padding: 0 25px;
}

.btn{
  width: 24px;
  height: 24px;
  background-color: #75a2c6;
  z-index: 100;
  color: white;
}
</style>
