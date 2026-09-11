<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'

defineProps<{ title: string, content: string | number, unit: string }>()
</script>

<template>
  <Card class="min-w-0 gap-3 shadow-none">
    <CardHeader class="px-3 sm:px-6">
      <CardDescription>{{ title }}</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-wrap items-baseline gap-2 px-3 sm:px-6">
      <span class="text-3xl font-semibold tracking-tight tabular-nums">{{ content }}</span>
      <span class="text-sm text-muted-foreground">{{ unit }}</span>
    </CardContent>
  </Card>
</template>
