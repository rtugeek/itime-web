<script setup lang="ts">

</script>

<template>
  <WidgetLandingPage base-url="/web" />
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
