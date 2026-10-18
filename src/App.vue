<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import VideoComponent from '@/components/videoComponent.vue'
import { VideoInfo } from '@/types/VideoInfo'
import { MediaFormat } from '@/types/MediaFormat'
import { VideoDetails } from '@/types/VideoDetails'
import { YtDlpProgress } from '@/types/YtDlpProgress'
import getFriendlyCodecName from '@/helpers/getFriendlyCodecName'
import formatBytesToMB from '@/helpers/formatBytesToMB'
import ProgressBarComponent from '@/components/progressBarComponent.vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/solid'
import { vRipple } from '@/directives/vRipple'
import WindowActions from '@/components/windowActions.vue'
import SettingsComponent from '@/components/settings/settingsComponent.vue'
import { useHistoryStore } from '@/stores/history'

const historyStore = useHistoryStore()

const isLoadingVideoData = ref<boolean>(false)

const videoFormats = ref<MediaFormat[]>([])
const videoDetails = ref<VideoDetails | null>(null)


const audioFormats = ref<MediaFormat[]>([])
const highestAudioFormat = ref<MediaFormat | undefined>(null)

const selectedTab = ref<number>(1)

const percentage = ref<number>(0)
const downloadState = ref<string>('')
const isDownloading = ref<boolean>(false)

const isSearchDisabled = computed(() => {
  return isLoadingVideoData.value || isDownloading.value
})

const videoUrl = ref<string>('')
const requestVideoInfo = async () => {
  const bridge = (window as any).bridge
  if (!bridge) {
    return
  }

  if (!videoUrl.value) {
    return
  }

  try {
    isLoadingVideoData.value = true

    const info: VideoInfo = await bridge.getVideoInfo(videoUrl.value)

    if (!info) {
      throw new Error('No video info')
    }

    if (!info.formats) {
      throw new Error('No formats')
    }
    // const audioFormats: MediaFormat = info.formats.filter(format => format.video_ext === 'none')
    videoFormats.value = info.formats
      .filter((format) => format.audio_ext === 'none' && format.filesize)
      .sort((a: MediaFormat, b: MediaFormat) => {
        // Primary: Compare height (e.g., 2400 vs 1080)
        const heightA = a.height ?? 0
        const heightB = b.height ?? 0
        if (heightB !== heightA) {
          return heightB - heightA // Higher height first
        }

        // Secondary fallback: Compare FPS (e.g., 60fps vs 30fps)
        const fpsA = a.fps ?? 0
        const fpsB = b.fps ?? 0
        return fpsB - fpsA // Higher FPS first
      })
      .map((format) => {
        return {
          ...format,
          formattedCodec: getFriendlyCodecName(format.vcodec),
          formattedFileSize: formatBytesToMB(format.filesize),
        }
      })

    audioFormats.value = info.formats.filter((format) => format.audio_ext !== 'none')

    highestAudioFormat.value = audioFormats.value.at(-1)

    videoDetails.value = {
      title: info.title,
      duration: info.duration_string,
      thumbnail: info.thumbnail,
      url: info.webpage_url,
    }

    if (videoDetails.value && audioFormats.value.length > 0) {
      selectedTab.value = 0
    }
  } catch (error) {
    console.error('loadVideoData', error)
  } finally {
    isLoadingVideoData.value = false
  }
}

const registerDownloadProgressListener = () => {
  const bridge = (window as any).bridge
  if (!bridge) {
    return
  }

  bridge.onDownloadProgress((progress: YtDlpProgress) => {
    if (progress.percentage !== undefined && progress.percentage > 0) {
      percentage.value = progress.percentage
    }

    if (progress.message) {
      downloadState.value = progress.message
    }

    if (progress.status === 'completed' || progress.status === 'error') {
      isDownloading.value = false
    }
  })
}

registerDownloadProgressListener()

const videoDownloadStarted = () => {
  isDownloading.value = true
  downloadState.value = 'Initiating...'
}



const isMaximized = ref<boolean>(false)
let removeListener: (() => void) | null = null

const registerElectronListeners = () => {
  const bridge = (window as any).bridge
  if (!bridge) {
    return
  }

  removeListener = bridge.on('app', (data: any) => {
    switch (data.action) {
      case 'maximize': {
        isMaximized.value = true
        break
      }
      case 'unmaximize': {
        isMaximized.value = false
        break
      }
    }
  })
}

onUnmounted(() => {
  if (removeListener) {
    removeListener()
  }
})
registerElectronListeners()

</script>

<template>
  <!-- 1. Change size-full to h-screen (or h-dvh) and overflow-hidden to constrain page height -->
  <div class="flex h-screen w-full flex-col gap-y-2 overflow-hidden bg-zinc-50 p-4 pt-2">
    <div class="flex w-full items-center justify-between [-webkit-app-region:drag]">
      <settings-component />
      <window-actions :isMaximized="isMaximized" />
    </div>
    <!-- Header Input Section -->
    <div
      class="flex w-full shrink-0 items-center gap-x-2 rounded-lg bg-zinc-100 p-2 inset-shadow-sm"
    >
      <MagnifyingGlassIcon class="size-6 text-zinc-400" />
      <input
        v-model="videoUrl"
        type="text"
        class="size-full rounded-lg p-2 text-sm text-zinc-700 outline-0"
        placeholder="Paste YouTube video link"
      />

      <button
        @click="requestVideoInfo()"
        v-ripple
        class="w-22 cursor-pointer rounded bg-sky-600 px-4 py-2 text-center text-sm text-white shadow transition-colors hover:bg-sky-500 active:bg-sky-700 disabled:cursor-default disabled:bg-neutral-400"
        :class="{ '!cursor-wait': isLoadingVideoData }"
        :disabled="isSearchDisabled"
      >
        Search
      </button>
    </div>

    <!-- 2. Section Wrapper: min-h-0 lets flex-1 shrink properly -->
    <div class="flex min-h-0 flex-1 flex-col">
      <!-- Tabs (Fixed height, won't shrink) -->
      <div class="flex shrink-0 items-center gap-x-2">
        <div
          @click="selectedTab = 0"
          class="p-2 text-sm text-zinc-900"
          v-if="videoFormats.length > 0"
          :class="{
            'font-semibold': selectedTab === 0,
            'cursor-pointer': selectedTab !== 0,
          }"
        >
          Results
        </div>
        <div
          @click="selectedTab = 1"
          class="p-2 text-sm text-zinc-600 hover:text-zinc-800"
          :class="{
            'font-semibold': selectedTab === 1,
            'cursor-pointer': selectedTab !== 1,
          }"
        >
          History
        </div>
      </div>

      <!-- 3. Results Container: Takes remaining space and enables independent vertical scroll -->
      <div
        class="min-h-0 w-full flex-1 scrollbar-gutter-both overflow-y-auto rounded-lg bg-zinc-100 p-2 inset-shadow-sm"
      >
        <template v-if="selectedTab === 0">
          <video-component
            v-for="format in videoFormats"
            :key="format.format_id"
            :videoDetails="videoDetails"
            :audioFormat="highestAudioFormat"
            :format="format"
            :isDownloading="isDownloading"
            @download="videoDownloadStarted()"
          />
        </template>

        <template v-if="selectedTab === 1">
          <video-component
            v-for="historyItem in historyStore.history"
            :key="historyItem.videoFormat.format_id"
            :videoDetails="historyItem.videoDetails"
            :audioFormat="historyItem.audioFormat"
            :format="historyItem.videoFormat"
            :isDownloading="isDownloading"
            @download="videoDownloadStarted()"
            :canDelete="true"
          />
        </template>
      </div>
    </div>

    <div class="w-full flex-0">
      <progress-bar-component :percentage="percentage" :text="downloadState" />
    </div>
  </div>
</template>

<style scoped></style>
