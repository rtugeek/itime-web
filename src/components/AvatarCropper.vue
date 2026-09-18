<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { avatarCropRect } from '@/utils/avatarCrop'
import { Button } from '@/components/ui/button'

const props = defineProps<{ src: string, disabled?: boolean }>()
const emit = defineEmits<{ ready: [value: boolean], error: [message: string] }>()
const canvas = ref<HTMLCanvasElement>()
const image = ref<HTMLImageElement>()
const zoom = ref(1)
const centerX = ref(0)
const centerY = ref(0)
let drag: { id: number, x: number, y: number } | undefined
const rect = computed(() => avatarCropRect(image.value?.naturalWidth || 1, image.value?.naturalHeight || 1, zoom.value, centerX.value, centerY.value))

function reset() {
  zoom.value = 1
  centerX.value = (image.value?.naturalWidth || 0) / 2
  centerY.value = (image.value?.naturalHeight || 0) / 2
}
watch(() => props.src, (src, _, onCleanup) => {
  emit('ready', false)
  image.value = undefined
  drag = undefined
  const next = new Image()
  next.onload = () => {
    image.value = next
    reset()
    emit('ready', true)
  }
  next.onerror = () => emit('error', '图片无法读取，请重新选择图片')
  next.src = src
  onCleanup(() => {
    next.onload = null
    next.onerror = null
  })
}, { immediate: true })

watch([canvas, image, rect], () => {
  const context = canvas.value?.getContext('2d')
  if (!context || !image.value) { return }
  const { x, y, size } = rect.value
  context.clearRect(0, 0, 512, 512)
  context.drawImage(image.value, x, y, size, size, 0, 0, 512, 512)
}, { flush: 'post' })

function move(dx: number, dy: number) {
  if (props.disabled || !image.value) { return }
  const { x, y, size } = rect.value
  const next = avatarCropRect(image.value.naturalWidth, image.value.naturalHeight, zoom.value, x + size / 2 + dx, y + size / 2 + dy)
  centerX.value = next.x + size / 2
  centerY.value = next.y + size / 2
}
function pointerDown(event: PointerEvent) {
  if (props.disabled || !image.value || event.button !== 0) { return }
  canvas.value?.setPointerCapture(event.pointerId)
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY }
}
function pointerMove(event: PointerEvent) {
  if (!drag || drag.id !== event.pointerId || !canvas.value) { return }
  const scale = rect.value.size / canvas.value.getBoundingClientRect().width
  move((drag.x - event.clientX) * scale, (drag.y - event.clientY) * scale)
  drag.x = event.clientX
  drag.y = event.clientY
}
function keyDown(event: KeyboardEvent) {
  const directions: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
  const direction = directions[event.key]
  if (!direction) { return }
  event.preventDefault()
  move(direction[0] * rect.value.size / 20, direction[1] * rect.value.size / 20)
}
async function getCroppedFile() {
  const surface = canvas.value
  if (!surface || !image.value) { throw new Error('请先选择并加载图片') }
  const blob = await new Promise<Blob | null>(resolve => surface.toBlob(resolve, 'image/png'))
  if (!blob) { throw new Error('图片裁剪失败，请重新选择图片') }
  return new File([blob], 'avatar.png', { type: 'image/png' })
}
defineExpose({ getCroppedFile })
</script>

<template>
  <div class="space-y-4">
    <canvas
      ref="canvas" width="512" height="512" tabindex="0"
      aria-label="头像裁剪预览，拖动图片或使用方向键调整位置"
      class="mx-auto block aspect-square w-full max-w-80 touch-none rounded-lg border bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
      :class="disabled ? 'cursor-wait' : 'cursor-move'"
      @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="drag = undefined" @pointercancel="drag = undefined" @lostpointercapture="drag = undefined" @keydown="keyDown"
    />
    <div class="flex items-center gap-3">
      <label for="avatar-zoom" class="shrink-0 text-sm">缩放</label>
      <input id="avatar-zoom" v-model.number="zoom" type="range" min="1" max="4" step="0.01" :disabled="disabled || !image" class="min-w-0 flex-1 accent-primary">
      <Button type="button" variant="ghost" size="sm" :disabled="disabled || !image" @click="reset">
        重置
      </Button>
    </div>
    <p class="text-xs text-muted-foreground">
      拖动图片调整位置，滑动缩放。裁剪比例固定为 1:1。
    </p>
  </div>
</template>
