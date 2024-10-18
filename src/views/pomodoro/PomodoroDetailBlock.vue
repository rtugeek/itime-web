<script setup lang="ts">
defineProps<{ title: string, content: string | number, unit: string }>()
</script>

<template>
  <nut-cell>
    <div class="block">
      <div class="title">
        {{ title }}
      </div>
      <div class="content font-bold text-2xl">
        {{ content }}
      </div>
      <div class="unit">
        {{ unit }}
      </div>
    </div>
  </nut-cell>
</template>

<style scoped lang="scss">
$text-color: #494644;

.nut-cell{
  color: $text-color;
  .block{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    margin: auto;
    .title,.unit{
      font-size: 12px;
    }
  }
}
</style>
