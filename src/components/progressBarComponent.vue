<script setup lang="ts">
import { computed } from 'vue'
import { useDownloadStore } from '@/stores/downloadStore'

const downloadStore = useDownloadStore()

const displayText = computed(() => {
  if (downloadStore.percentage === 0 || downloadStore.percentage === 100) {
    return downloadStore.downloadState
  }

  return `${downloadStore.downloadState} ${downloadStore.percentage}%`
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
      :style="{ clipPath: `inset(0 ${100 - downloadStore.percentage}% 0 0)` }"
    >
      {{ displayText }}
    </div>
  </div>
</template>
