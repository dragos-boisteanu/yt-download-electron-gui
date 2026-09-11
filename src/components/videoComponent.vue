<script setup lang="ts">
import { MediaFormat } from '@/types/MediaFormat'
import { VideoDetails } from '@/types/VideoDetails'

const props = defineProps<{
  format: MediaFormat
  videoDetails: VideoDetails | null
}>()
</script>

<template>
  <div class="rounded w-full bg-zinc-50 my-2 p-2 hover:shadow flex items-center gap-x-4">
    <div class="h-16 w-26 bg-zinc-500 rounded-lg shrink-0">
      <img
        class="object-fill size-full rounded-lg"
        :src="props.videoDetails?.thumbnail ? props.videoDetails?.thumbnail : ''"
      />
    </div>

    <!-- Key fix: min-w-0 stops flex child from growing past wrapper -->
    <div class="flex items-center gap-x-4 flex-1 min-w-0">
      <!-- Key fix: min-w-0 + truncate or line-clamp -->
      <div class="flex-1 min-w-0 flex flex-col justify-start gap-y-0.5">
        <!-- Truncates to 1 line with ellipsis -->
        <div class="text-zinc-900 text-sm font-semibold truncate">
          {{ props.videoDetails?.title }}
        </div>
        <div class="text-zinc-900 text-xs">
          <span class="font-semibold pr-1">Duration:</span>
          <span> {{ props.videoDetails?.duration }}</span>
        </div>
        <div class="text-zinc-900 text-xs">
          <span class="font-semibold pr-1">Size:</span>
          <span>{{ props.format.filesize }}</span>
        </div>
      </div>

      <div class="h-full flex items-center shrink-0">
        <div class="p-2 rounded bg-sky-500 text-white text-xs">
          {{ props.format.resolution }}
        </div>
      </div>
      <div class="h-full flex items-center shrink-0">
        <div class="p-2 rounded bg-amber-500 text-white uppercase text-xs">
          {{ props.format.vcodec }}
        </div>
      </div>
    </div>

    <button
      class="rounded bg-lime-500 shadow p-2 text-white cursor-pointer hover:bg-lime-400 active:inset-shadow-sm text-sm shrink-0"
    >
      Download
    </button>
  </div>
</template>

<style scoped></style>
