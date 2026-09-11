<script setup lang="ts">
import { ref } from 'vue'
import VideoComponent from '@/components/videoComponent.vue'
import { VideoInfo } from '@/types/VideoInfo'
import { MediaFormat } from '@/types/MediaFormat'
import { VideoDetails } from '@/types/VideoDetails'

const isLoadingVideoData = ref<boolean>(false)

const videoFormats = ref<MediaFormat[]>([])
const videoDetails = ref<VideoDetails | null>(null)

const videoUrl = ref<string>('')
const requestVideoInfo = async () => {
  // eslint-disable-next-line
  const bridge = (window as any).bridge

  console.log('bridge', bridge)
  if (!bridge) {
    return
  }

  try {
    isLoadingVideoData.value = true
    const info: VideoInfo = await bridge.getVideoInfo(videoUrl.value)

    if (!info) {
      throw new Error('No video info')
    }

    console.log('info', info)
    if (!info.formats) {
      throw new Error('No formats')
    }
    // const audioFormats: MediaFormat = info.formats.filter(format => format.video_ext === 'none')
    videoFormats.value = info.formats
      .filter((format) => format.audio_ext === 'none')
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

    videoDetails.value = {
      title: info.title,
      duration: info.duration,
      thumbnail: info.thumbnail,
    }
  } catch (error) {
    console.error('loadVideoData', error)
  } finally {
    isLoadingVideoData.value = false
  }
}
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
        <div class="p-2 text-sm text-zinc-900 font-semibold">Results</div>
        <div class="p-2 text-sm text-zinc-600 cursor-pointer hover:text-zinc-800">History</div>
      </div>

      <!-- 3. Results Container: Takes remaining space and enables independent vertical scroll -->
      <div class="w-full flex-1 min-h-0 inset-shadow-sm rounded-lg bg-zinc-100 overflow-y-auto p-2">
        <video-component
          v-for="format in videoFormats"
          :key="format.format_id"
          :videoDetails="videoDetails"
          :format="format"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
