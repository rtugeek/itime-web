<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  progress: {
    type: Number,
    required: true,
  },
  vertical: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'rgb(255, 170, 0)',
  },
  position: {
    type: String,
    default: 'bottom',
  },
  size: {
    type: Number,
    default: 6,
  },
})

const progressStyle = computed(() => {
  return `${props.progress}%`
})

const barSize = computed(() => {
  return `${props.size}px`
})
</script>

<template>
  <div class="pomodoro-progress-bar" :class="{ vertical }">
    <div class="outer" :class="{ vertical }" />
    <div class="inner" :class="{ vertical }" />
  </div>
</template>

<style scoped lang="scss">
.pomodoro-progress-bar {
  position: relative;
  width: 100%;
  height: v-bind(barSize);
  overflow: hidden;
  .outer, .inner{
    height: v-bind(barSize);
  }

  .outer {
    background: white;
    width: 100%;
  }

  .inner {
    background-color: v-bind(color);
    width: v-bind(progressStyle);
    top:0;
    bottom: 0;
    position: absolute;
    right:0;
    z-index: 1;
  }

  &.vertical {
    width: v-bind(barSize);
    height: 100%;

    .outer, .inner{
      width: v-bind(barSize);
    }

    .outer{
      height: 100%;
    }

    .inner {
      top:inherit;
      bottom: 0;
      height:  v-bind(progressStyle)
    }
  }

}
</style>
