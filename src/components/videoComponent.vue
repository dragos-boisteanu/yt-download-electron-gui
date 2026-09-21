<script setup lang="ts">
import { MediaFormat } from '@/types/MediaFormat'
import { VideoDetails } from '@/types/VideoDetails'
import { update } from 'idb-keyval'
import { DownloadsHistory } from '@/types/DownloadsHistory'
import { toRaw } from 'vue'

const props = defineProps<{
  format: MediaFormat
  videoDetails: VideoDetails | null
  audioFormat?: MediaFormat
}>()

const emits = defineEmits<{
  (e: 'listen'): void
}>()

const downloadVideo = async () => {
  const bridge = (window as any).bridge

  if (!bridge) {
    return
  }

  if (!props.videoDetails) {
    return
  }

  if (!props.videoDetails.url) {
    return
  }

  if (!props.audioFormat) {
    return
  }

  try {
    emits('listen')
    bridge.downloadVideo(
      props.videoDetails.url,
      props.format.format_id,
      props.audioFormat.format_id,
    )

    update('downloadsHistory', (value) => {
      if (!(props.videoDetails && props.audioFormat && props.format)) {
        return
      }

      const newHistoryEntry: DownloadsHistory = {
        videoDetails: toRaw(props.videoDetails),
        audioFormat: toRaw(props.audioFormat),
        videoFormat: toRaw(props.format),
      }

      if (value) {
        const entryIndex = value.findIndex(
          (entry: DownloadsHistory) => entry.videoDetails.url === newHistoryEntry.videoDetails.url,
        )

        if (entryIndex === -1) {
          value.push(newHistoryEntry)
        } else {
          value.splice(entryIndex, 1, newHistoryEntry)
        }
      } else {
        const history: DownloadsHistory[] = []
        history.push(newHistoryEntry)

        value = history
      }

      return value
    }).catch((error) => console.error('getDownloadsHistory', error))
  } catch (error: any) {
    console.error('downloadVideo', error)
  }
}
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
          <span>{{ props.format.formattedFileSize }}</span>
        </div>
      </div>

      <div class="h-full flex items-center shrink-0">
        <div
          class="p-2 rounded bg-sky-500 text-white text-xs text-center max-w-20 min-w-20 text-center"
        >
          {{ props.format.resolution }}
        </div>
      </div>
      <div class="h-full flex items-center shrink-0">
        <div
          class="p-2 rounded bg-amber-500 text-white uppercase text-xs min-w-12 max-w-12 text-center"
        >
          {{ props.format.formattedCodec }}
        </div>
      </div>
    </div>

    <button
      @click="downloadVideo()"
      class="rounded bg-lime-500 shadow p-2 text-white cursor-pointer hover:bg-lime-400 active:inset-shadow-sm text-sm shrink-0"
    >
      Download
    </button>
  </div>
</template>

<style scoped></style>
