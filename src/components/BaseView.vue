<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BaseView',
  props: {
    title: String,
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
  },
})
</script>

<template>
  <div class="flex flex-col w-full">
    <nut-navbar :title="title" left-show @click-back="goBack" />
    <slot />
  </div>
</template>

<style scoped>

</style>
