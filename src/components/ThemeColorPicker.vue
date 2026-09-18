<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const props = defineProps<{ id: string, label: string }>()
const model = defineModel<string>()

function hexToRgb(hex: string): [number, number, number, number] {
  let h = hex.replace('#', '')
  if (h.length === 3) { h = h.split('').map(c => c + c).join('') }
  if (h.length === 4) { h = h.split('').map(c => c + c).join('') }
  const a = h.length === 8 ? Number.parseInt(h.slice(6, 8), 16) / 255 : 1
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
    a,
  ]
}

function rgbToHex(r: number, g: number, b: number, a = 1): string {
  const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`
  if (a < 1) { hex += toHex(a * 255) }
  return hex.toUpperCase()
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max
  if (d !== 0) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h *= 60
  }
  return [h, s, v]
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = v - c
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) {
    r = c
    g = x
    b = 0
  }
  else if (h < 120) {
    r = x
    g = c
    b = 0
  }
  else if (h < 180) {
    r = 0
    g = c
    b = x
  }
  else if (h < 240) {
    r = 0
    g = x
    b = c
  }
  else if (h < 300) {
    r = x
    g = 0
    b = c
  }
  else {
    r = c
    g = 0
    b = x
  }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255]
}

function parseColor(color: string): [number, number, number, number] {
  if (!color) { return [0, 0, 0, 1] }
  if (color.startsWith('#')) { return hexToRgb(color) }
  const m = color.match(/rgba?\(([^)]+)\)/)
  if (m) {
    const parts = m[1].split(',').map(s => s.trim())
    const r = Number(parts[0]) || 0
    const g = Number(parts[1]) || 0
    const b = Number(parts[2]) || 0
    const a = parts[3] !== undefined ? Number(parts[3]) : 1
    return [r, g, b, a]
  }
  return [0, 0, 0, 1]
}

const [initR, initG, initB, initA] = parseColor(model.value || '#000000')
const [initH, initS, initV] = rgbToHsv(initR, initG, initB)

const hue = ref(initH)
const sat = ref(initS)
const val = ref(initV)
const alpha = ref(initA)

const rgb = computed((): [number, number, number] => hsvToRgb(hue.value, sat.value, val.value))
const hexNoAlpha = computed(() => rgbToHex(rgb.value[0], rgb.value[1], rgb.value[2]))
const rVal = computed(() => Math.round(rgb.value[0]))
const gVal = computed(() => Math.round(rgb.value[1]))
const bVal = computed(() => Math.round(rgb.value[2]))
const aVal = computed(() => Math.round(alpha.value * 100))

const hexInput = ref(hexNoAlpha.value.slice(1))
const rInput = ref(String(rVal.value))
const gInput = ref(String(gVal.value))
const bInput = ref(String(bVal.value))
const aInput = ref(String(aVal.value))

watch(model, (nv) => {
  if (!nv) { return }
  const [r, g, b, a] = parseColor(nv)
  const [h, s, v] = rgbToHsv(r, g, b)
  hue.value = h
  sat.value = s
  val.value = v
  alpha.value = a
})

watch([hue, sat, val, alpha], () => {
  const [r, g, b] = rgb.value
  model.value = rgbToHex(r, g, b, alpha.value)
  hexInput.value = hexNoAlpha.value.slice(1)
  rInput.value = String(rVal.value)
  gInput.value = String(gVal.value)
  bInput.value = String(bVal.value)
  aInput.value = String(aVal.value)
}, { immediate: false })

const svPanelRef = ref<HTMLDivElement | null>(null)
const hueBarRef = ref<HTMLDivElement | null>(null)
const alphaBarRef = ref<HTMLDivElement | null>(null)

let dragging: 'sv' | 'hue' | 'alpha' | null = null

function getRelPos(e: MouseEvent | TouchEvent, el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const point = 'touches' in e ? e.touches[0] : (e as MouseEvent)
  const x = Math.max(0, Math.min(1, (point.clientX - rect.left) / rect.width))
  const y = Math.max(0, Math.min(1, (point.clientY - rect.top) / rect.height))
  return { x, y }
}

function onDown(type: 'sv' | 'hue' | 'alpha', e: MouseEvent | TouchEvent) {
  e.preventDefault()
  dragging = type
  onMove(e)
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('touchend', onUp)
}

function onMove(e: MouseEvent | TouchEvent) {
  if (!dragging) { return }
  e.preventDefault()
  if (dragging === 'sv' && svPanelRef.value) {
    const { x, y } = getRelPos(e, svPanelRef.value)
    sat.value = x
    val.value = 1 - y
  }
  else if (dragging === 'hue' && hueBarRef.value) {
    const { x } = getRelPos(e, hueBarRef.value)
    hue.value = x * 360
  }
  else if (dragging === 'alpha' && alphaBarRef.value) {
    const { x } = getRelPos(e, alphaBarRef.value)
    alpha.value = x
  }
}

function onUp() {
  dragging = null
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', onUp)
  window.removeEventListener('touchmove', onMove)
  window.removeEventListener('touchend', onUp)
}

onBeforeUnmount(onUp)

const pureHueColor = computed(() => {
  const [r, g, b] = hsvToRgb(hue.value, 1, 1)
  return `rgb(${r}, ${g}, ${b})`
})

const svPointerStyle = computed(() => ({
  left: `${sat.value * 100}%`,
  top: `${(1 - val.value) * 100}%`,
}))

const huePointerStyle = computed(() => ({
  left: `${(hue.value / 360) * 100}%`,
}))

const alphaPointerStyle = computed(() => ({
  left: `${alpha.value * 100}%`,
}))

const previewColorStyle = computed(() => {
  const [r, g, b] = rgb.value
  return `rgba(${r}, ${g}, ${b}, ${alpha.value})`
})

const alphaGradient = computed(() => {
  const [r, g, b] = rgb.value
  return `linear-gradient(90deg, rgba(${r},${g},${b},0) 0%, rgb(${r},${g},${b}) 100%)`
})

function commitHex() {
  const v = hexInput.value.trim()
  if (/^[\da-f]{6}$/i.test(v) || /^[\da-f]{3}$/i.test(v)) {
    const [r, g, b] = hexToRgb(`#${v}`)
    const [h, s, val_v] = rgbToHsv(r, g, b)
    hue.value = h
    sat.value = s
    val.value = val_v
  }
  else {
    hexInput.value = hexNoAlpha.value.slice(1)
  }
}

function commitRgb(channel: 0 | 1 | 2) {
  const inputs = [rInput, gInput, bInput]
  const vals = [rVal, gVal, bVal]
  const raw = Number(inputs[channel].value)
  if (!Number.isNaN(raw) && raw >= 0 && raw <= 255) {
    const rgbArr = [rVal.value, gVal.value, bVal.value]
    rgbArr[channel] = raw
    const [h, s, v] = rgbToHsv(rgbArr[0], rgbArr[1], rgbArr[2])
    hue.value = h
    sat.value = s
    val.value = v
  }
  else {
    inputs[channel].value = String(vals[channel].value)
  }
}

function commitAlpha() {
  const raw = Number(aInput.value)
  if (!Number.isNaN(raw) && raw >= 0 && raw <= 100) {
    alpha.value = raw / 100
  }
  else {
    aInput.value = String(aVal.value)
  }
}

const presets = [
  '#DC2626',
  '#EA580C',
  '#FACC15',
  '#92400E',
  '#84CC16',
  '#4D7C0F',
  '#C026D3',
  '#7E22CE',
  '#3B82F6',
  '#2DD4BF',
  '#BBF7D0',
  '#000000',
  '#44403C',
  '#A1A1AA',
  '#FFFFFF',
]

function applyPreset(color: string) {
  const [r, g, b, a] = parseColor(color)
  const [h, s, v] = rgbToHsv(r, g, b)
  hue.value = h
  sat.value = s
  val.value = v
  alpha.value = a
}
</script>

<template>
  <div class="flex min-w-0 items-center gap-2">
    <Popover>
      <PopoverTrigger as-child>
        <Button variant="outline" size="icon" class="size-9 shrink-0 p-1.5 shadow-none" :aria-label="`选择${props.label}`">
          <span class="color-swatch size-full overflow-hidden rounded-sm border"><span class="block size-full" :style="{ backgroundColor: model }" /></span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" class="w-[300px] h-[400px] overflow-y-auto p-4 space-y-4">
        <div
          ref="svPanelRef"
          class="sv-panel relative w-full h-[320px] rounded cursor-crosshair select-none"
          :style="{ backgroundColor: pureHueColor }"
          @mousedown="e => onDown('sv', e)"
          @touchstart="e => onDown('sv', e)"
        >
          <div class="absolute inset-0" style="background: linear-gradient(90deg, #fff, transparent)" />
          <div class="absolute inset-0" style="background: linear-gradient(0deg, #000, transparent)" />
          <div class="sv-pointer absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)] pointer-events-none" :style="svPointerStyle" />
        </div>

        <div class="flex gap-3 items-start">
          <div class="flex-1 space-y-2">
            <div
              ref="hueBarRef"
              class="hue-bar relative w-full h-6 rounded cursor-pointer select-none"
              style="background: linear-gradient(90deg, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)"
              @mousedown="e => onDown('hue', e)"
              @touchstart="e => onDown('hue', e)"
            >
              <div class="absolute w-1.5 h-8 -top-1 -ml-0.75 bg-white border-2 border-black/60 rounded-sm pointer-events-none" :style="huePointerStyle" />
            </div>
            <div
              ref="alphaBarRef"
              class="alpha-bar relative w-full h-6 rounded cursor-pointer select-none"
              style="background: repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 10px 10px;"
              @mousedown="e => onDown('alpha', e)"
              @touchstart="e => onDown('alpha', e)"
            >
              <div class="absolute inset-0 rounded" :style="{ background: alphaGradient }" />
              <div class="absolute w-1.5 h-8 -top-1 -ml-0.75 bg-white border-2 border-black/60 rounded-sm pointer-events-none" :style="alphaPointerStyle" />
            </div>
          </div>
          <div class="color-preview size-16 rounded border shrink-0" style="background: repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px;">
            <div class="size-full rounded" :style="{ backgroundColor: previewColorStyle }" />
          </div>
        </div>

        <div class="grid grid-cols-5 gap-2">
          <div class="space-y-1.5 text-center">
            <Input v-model="hexInput" class="text-center font-mono text-lg h-10 uppercase" maxlength="8" @blur="commitHex" @keydown.enter="commitHex" />
            <div class="text-xs text-muted-foreground">
              Hex
            </div>
          </div>
          <div class="space-y-1.5 text-center">
            <Input v-model="rInput" class="text-center font-mono text-lg h-10" maxlength="3" @blur="commitRgb(0)" @keydown.enter="commitRgb(0)" />
            <div class="text-xs text-muted-foreground">
              R
            </div>
          </div>
          <div class="space-y-1.5 text-center">
            <Input v-model="gInput" class="text-center font-mono text-lg h-10" maxlength="3" @blur="commitRgb(1)" @keydown.enter="commitRgb(1)" />
            <div class="text-xs text-muted-foreground">
              G
            </div>
          </div>
          <div class="space-y-1.5 text-center">
            <Input v-model="bInput" class="text-center font-mono text-lg h-10" maxlength="3" @blur="commitRgb(2)" @keydown.enter="commitRgb(2)" />
            <div class="text-xs text-muted-foreground">
              B
            </div>
          </div>
          <div class="space-y-1.5 text-center">
            <Input v-model="aInput" class="text-center font-mono text-lg h-10" maxlength="3" @blur="commitAlpha" @keydown.enter="commitAlpha" />
            <div class="text-xs text-muted-foreground">
              A
            </div>
          </div>
        </div>

        <div class="pt-2 border-t">
          <div class="grid grid-cols-8 gap-2">
            <Button
              v-for="(color, idx) in presets"
              :key="idx"
              variant="outline"
              class="size-10 rounded-md p-0 border-border"
              :style="{ backgroundColor: color }"
              :aria-label="color"
              @click="applyPreset(color)"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
    <Input :id="id" :model-value="model" class="h-9 font-mono text-xs shadow-none" readonly />
  </div>
</template>

<style scoped>
.color-swatch {
  background: repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 50% / 8px 8px;
}
.sv-panel {
  background-size: cover;
  background-position: center;
}
</style>
