<script setup lang="ts">
import { MediaFormat } from '@/types/MediaFormat'
import { VideoDetails } from '@/types/VideoDetails'
import { vRipple } from '@/directives/vRipple'
import { TrashIcon } from '@heroicons/vue/24/outline'
import { useHistoryStore } from '@/stores/history'
import { toRaw } from 'vue'

const historyStore = useHistoryStore()

const props = defineProps<{
  format: MediaFormat
  videoDetails: VideoDetails | null
  audioFormat?: MediaFormat
  isDownloading: boolean
  canDelete?: boolean
}>()

const emits = defineEmits<{
  (e: 'download'): void
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
    if (!(props.videoDetails && props.audioFormat && props.format)) {
      return
    }

    emits('download')

    bridge.downloadVideo(
      props.videoDetails.url,
      props.format.format_id,
      props.audioFormat.format_id,
    )

    historyStore
      .add(toRaw(props.videoDetails), toRaw(props.audioFormat), toRaw(props.format))
      .catch((error: any) => console.error('saveDownloadVideoHistory', error))
  } catch (error: any) {
    console.error('downloadVideo', error)
  }
}

const removeHistoryItem = () => {
  historyStore
    .remove(props.format.format_id)
    .catch((error) => console.error('removeHistoryItem', error))
}
</script>

<template>
  <div class="my-2 flex w-full flex-wrap items-center gap-4 rounded bg-zinc-50 p-2 hover:shadow">
    <div class="flex min-w-96 flex-1 items-start gap-x-4">
      <button
        v-if="canDelete"
        @click="removeHistoryItem"
        class="inset-shadow cursor-pointer self-center rounded-full p-2 transition-colors ease-in-out hover:bg-zinc-100 active:bg-zinc-200"
      >
        <TrashIcon class="size-5"></TrashIcon>
      </button>

      <div class="h-16 w-26 rounded-lg bg-zinc-500">
        <img
          class="size-full rounded-lg object-cover"
          :src="props.videoDetails?.thumbnail ? props.videoDetails?.thumbnail : ''"
        />
      </div>

      <!-- Key fix: min-w-0 stops flex child from growing past wrapper -->
      <div class="flex min-w-0 flex-1 items-center gap-x-4">
        <!-- Key fix: min-w-0 + truncate or line-clamp -->
        <div class="flex min-w-0 flex-1 flex-col justify-start gap-y-0.5">
          <!-- Truncates to 1 line with ellipsis -->
          <div class="truncate text-sm font-semibold text-zinc-900">
            {{ props.videoDetails?.title }}
          </div>
          <div class="flex items-center gap-x-2">
            <div class="text-xs text-zinc-900">
              <span class="pr-1 font-semibold">Duration:</span>
              <span> {{ props.videoDetails?.duration }}</span>
            </div>
            <div class="text-xs text-zinc-900">
              <span class="pr-1 font-semibold">Size:</span>
              <span>{{ props.format.formattedFileSize }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex w-full items-center justify-between gap-4 md:w-fit">
      <div class="flex items-center gap-x-4">
        <div
          class="w-20 rounded-md border border-orange-100 bg-orange-50 px-2 py-1 text-center text-xs text-orange-700"
        >
          {{ props.format.resolution }}
        </div>

        <div
          class="w-12 justify-center rounded-md bg-slate-100 px-2 py-1 text-center text-xs font-bold text-slate-600"
        >
          {{ props.format.formattedCodec }}
        </div>
      </div>

      <button
        :disabled="isDownloading"
        @click="downloadVideo()"
        v-ripple
        class="shrink-0 cursor-pointer rounded bg-sky-600 p-2 text-sm text-white shadow transition-colors hover:bg-sky-500 disabled:cursor-default disabled:bg-neutral-400"
      >
        Download
      </button>
    </div>
  </div>
</template>

<style scoped></style>
