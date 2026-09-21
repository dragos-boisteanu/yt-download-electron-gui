<script setup lang="ts">
import { computed, ref } from 'vue'
import VideoComponent from '@/components/videoComponent.vue'
import { VideoInfo } from '@/types/VideoInfo'
import { MediaFormat } from '@/types/MediaFormat'
import { VideoDetails } from '@/types/VideoDetails'
import { YtDlpProgress } from '@/types/YtDlpProgress'
import getFriendlyCodecName from '@/helpers/getFriendlyCodecName'
import formatBytesToMB from '@/helpers/formatBytesToMB'
import { get } from 'idb-keyval'
import { DownloadsHistory } from '@/types/DownloadsHistory'
import ProgressBarComponent from '@/components/progressBarComponent.vue'

const isLoadingVideoData = ref<boolean>(false)

const videoFormats = ref<MediaFormat[]>([])
const videoDetails = ref<VideoDetails | null>(null)

const downloadsHistory = ref<DownloadsHistory[]>([])

const audioFormats = ref<MediaFormat[]>([])
const highestAudioFormat = ref<MediaFormat | undefined>(null)

const selectedTab = ref<number>(1)

const percentage = ref<number>(0)
const downloadState = ref<string>('')
const isDownloading = ref<boolean>(false)

const videoUrl = ref<string>('')
const requestVideoInfo = async () => {
  const bridge = (window as any).bridge
  if (!bridge) {
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
    console.log('progress', progress)

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

const getHistory = async () => {
  try {
    const downloads = await get('downloadsHistory')

    if (downloads) {
      downloadsHistory.value = downloads
    }
  } catch (error) {
    console.error('getHistory', error)
  }
}

getHistory()
</script>

<template>
  <!-- 1. Change size-full to h-screen (or h-dvh) and overflow-hidden to constrain page height -->
  <div class="h-screen w-full flex flex-col bg-zinc-50 p-4 gap-y-4 overflow-hidden">
    <!-- Header Input Section -->
    <div class="w-full flex items-center gap-x-4 shrink-0">
      <div class="rounded shadow bg-zinc-100 p-2 flex-1">
        <input
          v-model="videoUrl"
          type="text"
          class="size-full outline-0 text-zinc-600 text-sm"
          placeholder="Video link"
        />
      </div>
      <button
        @click="requestVideoInfo"
        class="rounded bg-lime-500 shadow p-2 text-white cursor-pointer hover:bg-lime-400 active:inset-shadow-sm disabled:bg-neutral-400"
        :disabled="isLoadingVideoData"
      >
        Search
      </button>
    </div>

    <!-- 2. Section Wrapper: min-h-0 lets flex-1 shrink properly -->
    <div class="flex-1 flex flex-col min-h-0">
      <!-- Tabs (Fixed height, won't shrink) -->
      <div class="flex items-center gap-x-2 shrink-0">
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
      <div class="w-full flex-1 min-h-0 inset-shadow-sm rounded-lg bg-zinc-100 overflow-y-auto p-2">
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
            v-for="historyItem in downloadsHistory"
            :key="historyItem.videoFormat.format_id"
            :videoDetails="historyItem.videoDetails"
            :audioFormat="historyItem.audioFormat"
            :format="historyItem.videoFormat"
            :isDownloading="isDownloading"
            @download="videoDownloadStarted()"
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
