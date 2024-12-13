<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseView from '@/components/BaseView.vue'
import { AndroidAppSettingApi } from '@/api/android/AndroidAppSettingApi'

const { t } = useI18n()

function addWidget(type: number, layoutStyle: number) {
  AndroidAppSettingApi.requestPinWidget(type, layoutStyle)
}
</script>

<template>
  <BaseView :title="t('widgets')">
    <div class="flex flex-col px-2 overflow-auto scrollbar">
      <nut-cell>
        <div class="flex flex-col gap-4">
          <p>1x1</p>
          <div class="flex overflow-auto gap-4">
            <img class="cell-1" src="@/assets/image/preview_widget_mini_calendar.webp" alt="" @click="addWidget(1, 0)">
            <img class="cell-1" src="@/assets/image/preview_widget_mini_pure.webp" alt="" @click="addWidget(1, 1)">
            <img class="cell-1" src="@/assets/image/preview_widget_mini_progress.webp" alt="" @click="addWidget(1, 2)">
            <img class="cell-1" src="@/assets/image/preview_widget_mini_gradient.webp" alt="" @click="addWidget(1, 4)">
          </div>
        </div>
      </nut-cell>
      <nut-cell>
        <div class="flex flex-col gap-4">
          <p>1x2</p>
          <div class="flex overflow-auto gap-4">
            <img class="cell-1" src="@/assets/image/preview_1x2_calendar.webp" alt="" @click="addWidget(9, 0)">
            <img class="cell-1" src="@/assets/image/preview_1x2_color.webp" alt="" @click="addWidget(9, 1)">
            <img class="cell-1" src="@/assets/image/preview_1x2_wave.webp" alt="" @click="addWidget(9, 2)">
            <img class="cell-1" src="@/assets/image/preview_1x2_gradient.webp" alt="" @click="addWidget(9, 4)">
          </div>
        </div>
      </nut-cell>
      <nut-cell>
        <div class="flex flex-col gap-4 overflow-x-auto scrollbar">
          <p>2x1</p>
          <div class="flex gap-4">
            <img class="cell-2" src="@/assets/image/preview_2x1_calendar.webp" alt="" @click="addWidget(10, 0)">
            <img class="cell-2" src="@/assets/image/preview_2x1_color.webp" alt="" @click="addWidget(10, 1)">
            <img class="cell-2" src="@/assets/image/preview_2x1_wave.png" alt="" @click="addWidget(10, 2)">
            <img class="cell-2" src="@/assets/image/preview_2x1_dashboard.webp" alt="" @click="addWidget(10, 3)">
            <img class="cell-2" src="@/assets/image/preview_2x1_gradient.webp" alt="" @click="addWidget(10, 4)">
          </div>
        </div>
      </nut-cell>
      <nut-cell>
        <div class="flex flex-col gap-4 overflow-x-auto scrollbar">
          <p>2x2</p>
          <div class="flex gap-4">
            <img class="cell-2" src="@/assets/image/preview_2x2_calendar.webp" alt="" @click="addWidget(3, 2)">
            <img class="cell-2" src="@/assets/image/preview_2x2_focus.webp" alt="" @click="addWidget(3, 6)">
            <img class="cell-2" src="@/assets/image/preview_2x2_clipboard.webp" alt="" @click="addWidget(3, 1)">
            <img class="cell-2" src="@/assets/image/preview_2x2_clock_retro.png" alt="" @click="addWidget(3, 5)">
            <img class="cell-2" src="@/assets/image/preview_2x2_clock.webp" alt="" @click="addWidget(3, 4)">
            <img class="cell-2" src="@/assets/image/preview_2x2_image.webp" alt="" @click="addWidget(3, 0)">
            <img class="cell-2" src="@/assets/image/preview_2x2_clock_trump.png" alt="" @click="addWidget(3, 7)">
            <img class="cell-2" src="@/assets/image/preview_2x2_meme_cat.webp" alt="" @click="addWidget(3, 8)">
          </div>
        </div>
      </nut-cell>
      <nut-cell>
        <div class="flex flex-col gap-4 overflow-x-auto scrollbar">
          <p>4x1</p>
          <div class="flex gap-4">
            <img class="cell-4" src="@/assets/image/preview_4x1_color.webp" alt="" @click="addWidget(5, 0)">
            <img class="cell-4" src="@/assets/image/preview_4x1_picture.webp" alt="" @click="addWidget(5, 1)">
          </div>
        </div>
      </nut-cell>
      <nut-cell>
        <div class="flex flex-col gap-4 overflow-x-auto scrollbar">
          <p>4x2</p>
          <div class="flex gap-4">
            <img class="cell-4" src="@/assets/image/preview_4x2_realtime.webp" alt="" @click="addWidget(6, 0)">
            <img class="cell-4" src="@/assets/image/preview_4x2_holiday.webp" alt="" @click="addWidget(6, 2)">
            <img class="cell-4" src="@/assets/image/preview_4x2_progress.webp" alt="" @click="addWidget(6, 3)">
          </div>
        </div>
      </nut-cell>
      <nut-cell>
        <div class="flex flex-col gap-4 overflow-x-auto scrollbar">
          <p>4x3</p>
          <div class="flex gap-4">
            <img class="cell-4" src="@/assets/image/preview_4x3_list.webp" alt="" @click="addWidget(2, 0)">
          </div>
        </div>
      </nut-cell>
    </div>
  </BaseView>
</template>

<style lang="scss">
.cell-1 {
  width: 60px;
  height: auto;
  object-fit: contain;
}

.cell-2 {
  width: 120px;
  height: auto;
  object-fit: contain;
}

p {
  font-size: 1.25rem;
  font-weight: bold;
}

.cell-4 {
  width: 240px;
  height: auto;
  object-fit: contain;
}

img {
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.1));
}

.scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}

.scrollbar::-webkit-scrollbar-thumb {
  opacity: 0.5;
}
</style>
