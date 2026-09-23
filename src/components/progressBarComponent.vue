<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  percentage: number
  text: string
}>()

const displayText = computed(() => {
  if (props.percentage === 0 || props.percentage === 100) {
    return props.text
  }

  return `${props.text} ${props.percentage}%`
})
</script>
<template>
  <div class="relative h-6 w-full overflow-hidden rounded-lg bg-sky-100 text-xs font-semibold">
    <!-- Bottom Layer: Light background + Dark text -->
    <div class="absolute inset-0 flex items-center justify-center text-sky-950">
      {{ displayText }}
    </div>

    <!-- Top Layer: Blue background + White text (Clipped dynamically) -->
    <div
      class="absolute inset-0 flex items-center justify-center bg-sky-600 text-white transition-[clip-path] duration-200"
      :style="{ clipPath: `inset(0 ${100 - props.percentage}% 0 0)` }"
    >
      {{ displayText }}
    </div>
  </div>
</template>
