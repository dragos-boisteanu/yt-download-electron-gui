<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import VideoComponent from '@/components/videoComponent.vue'
import { VideoInfo } from '@/types/VideoInfo'
import { MediaFormat } from '@/types/MediaFormat'
import getFriendlyCodecName from '@/helpers/getFriendlyCodecName'
import formatBytesToMB from '@/helpers/formatBytesToMB'
import ProgressBarComponent from '@/components/progressBarComponent.vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/solid'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { vRipple } from '@/directives/vRipple'
import WindowActions from '@/components/windowActions.vue'
import SettingsComponent from '@/components/settings/settingsComponent.vue'
import { useHistoryStore } from '@/stores/history'
import debounce from 'lodash-es/debounce'
import VideoSkeletonLoader from '@/components/VideoSkeletonLoader.vue'
import QueueToggler from '@/components/queue/queueToggler.vue'
import { useDownloadStore } from '@/stores/downloadStore'
import { DownloadItem } from '@/types/DownloadItem'
import formatSeconds from '@/helpers/formatSeconds'

const historyStore = useHistoryStore()

const isLoadingVideoData = ref<boolean>(false)

const downloadItems = ref<DownloadItem[]>([])

const selectedTab = ref<number>(1)

const videoUrl = ref<string>('')

const requestVideoInfo = debounce(async () => {
  if (isLoadingVideoData.value) {
    return
  }

  if (!videoUrl.value) {
    return
  }

  const regex = /^https:\/\/www\.youtube\.com\/(?:shorts\/[a-zA-Z0-9_-]+|watch\?v=[a-zA-Z0-9_-]+)/
  if (!regex.test(videoUrl.value)) {
    return
  }

  const bridge = (window as any).bridge
  if (!bridge) {
    return
  }

  if (!videoUrl.value) {
    return
  }

  try {
    isLoadingVideoData.value = true
    selectedTab.value = 0

    const info: VideoInfo = await bridge.getVideoInfo(videoUrl.value)

    if (!info) {
      throw new Error('No video info')
    }

    if (!info.formats) {
      throw new Error('No formats')
    }

    const audioFormats = info.formats.filter((format) => format.audio_ext !== 'none')

    const highestAudioFormat = audioFormats.at(-1)

    downloadItems.value = info.formats
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
      .map((format): DownloadItem => {
        return {
          videoId: format.format_id,
          audioId: highestAudioFormat.format_id,
          url: videoUrl.value,
          codec: getFriendlyCodecName(format.vcodec),
          duration: formatSeconds(info.duration),
          size: formatBytesToMB(format.filesize),
          resolution: format.resolution,
          thumbnail: info.thumbnail,
          title: info.title,
          uniqueId: `${format.format_id}:${highestAudioFormat.format_id}`,
        }
      })
  } catch (error) {
    console.error('loadVideoData', error)
  } finally {
    isLoadingVideoData.value = false
  }
}, 250)

onUnmounted(() => {
  requestVideoInfo.cancel()
})

const clearUrl = () => {
  videoUrl.value = ''
}

const downloadStore = useDownloadStore()
downloadStore.registerDownloadProgressListener()

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
registerElectronListeners()

onUnmounted(() => {
  if (removeListener) {
    removeListener()
  }
})
</script>

<template>
  <!-- 1. Change size-full to h-screen (or h-dvh) and overflow-hidden to constrain page height -->
  <div class="flex h-screen w-full flex-col gap-y-2 overflow-hidden bg-zinc-50 p-4 pt-2">
    <div class="flex w-full items-center justify-between [-webkit-app-region:drag]">
      <settings-component />

      <div class="flex items-center gap-x-4">
        <div class="[-webkit-app-region:no-drag]">
          <queue-toggler />
        </div>
        <window-actions :isMaximized="isMaximized" />
      </div>
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
        @input="requestVideoInfo"
      />

      <button
        v-if="videoUrl !== '' && !isLoadingVideoData"
        @click="clearUrl"
        v-ripple
        class="inset-shadow cursor-pointer rounded-full p-2 transition-colors ease-in-out hover:bg-zinc-100 active:bg-zinc-200"
        :disabled="isLoadingVideoData"
      >
        <XMarkIcon class="size-4" />
      </button>
    </div>

    <!-- 2. Section Wrapper: min-h-0 lets flex-1 shrink properly -->
    <div class="flex min-h-0 flex-1 flex-col">
      <!-- Tabs (Fixed height, won't shrink) -->
      <div class="flex shrink-0 items-center gap-x-2">
        <div
          @click="selectedTab = 0"
          class="p-2 text-sm text-zinc-900"
          v-if="downloadItems.length > 0 || isLoadingVideoData"
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
        class="min-h-0 w-full flex-1 scrollbar-gutter-auto overflow-y-auto rounded-xl bg-zinc-100 px-2 inset-shadow-sm"
      >
        <template v-if="isLoadingVideoData">
          <video-skeleton-loader v-for="i in 4" :key="i" />
        </template>
        <template v-else-if="selectedTab === 0">
          <video-component v-for="item in downloadItems" :key="item.videoId" :item="item" />
        </template>
        <template v-else-if="selectedTab === 1">
          <video-component
            v-for="historyItem in historyStore.history"
            :key="historyItem.videoId"
            :item="historyItem"
            :canDelete="true"
          />
        </template>
      </div>
    </div>

    <div class="w-full flex-0">
      <progress-bar-component />
    </div>
  </div>
</template>

<style scoped></style>
