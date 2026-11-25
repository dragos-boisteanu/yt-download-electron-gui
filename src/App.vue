<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import VideoComponent from '@/components/videoComponent.vue'
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
import { useSearchStore } from '@/stores/searchStore'
import { useBookmarksStore } from '@/stores/bookmarksStore'

const historyStore = useHistoryStore()

const bookmarksStore = useBookmarksStore()

const selectedTab = ref<number>(1)

const videoUrl = ref<string>('')

const searchStore = useSearchStore()
const requestVideoInfo = debounce(async () => {
  if (!videoUrl.value) {
    return
  }

  try {
    selectedTab.value = 0
    searchStore.search(videoUrl.value)
  } catch (error) {
    console.error('loadVideoData', error)
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
    switch (data.type) {
      case 'maximize': {
        isMaximized.value = true
        break
      }
      case 'unmaximize': {
        isMaximized.value = false
        break
      }

      case 'fileRemoved': {
        historyStore.updateHistoryEntry(data.payload.id, { fileDeleted: true })
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
        v-if="videoUrl !== '' && !searchStore.isSearching"
        @click="clearUrl"
        v-ripple
        class="inset-shadow cursor-pointer rounded-full p-2 transition-colors ease-in-out hover:bg-zinc-100 active:bg-zinc-200"
        :disabled="searchStore.isSearching"
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
          v-if="searchStore.results.length > 0 || searchStore.isSearching"
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
        <div
          @click="selectedTab = 2"
          class="p-2 text-sm text-zinc-600 hover:text-zinc-800"
          :class="{
            'font-semibold': selectedTab === 2,
            'cursor-pointer': selectedTab !== 2,
          }"
        >
          Bookmarks
        </div>
      </div>

      <!-- 3. Results Container: Takes remaining space and enables independent vertical scroll -->
      <div
        class="min-h-0 w-full flex-1 scrollbar-gutter-auto overflow-y-auto rounded-xl bg-zinc-100 px-2 inset-shadow-sm"
      >
        <template v-if="searchStore.isSearching">
          <video-skeleton-loader v-for="i in 4" :key="i" />
        </template>
        <template v-else-if="selectedTab === 0">
          <video-component v-for="item in searchStore.results" :key="item.videoId" :item="item" />
        </template>
        <template v-else-if="selectedTab === 1">
          <video-component
            v-for="historyItem in historyStore.history"
            :key="historyItem.videoId"
            :item="historyItem"
          /> </template
        ><template v-else-if="selectedTab === 2">
          <video-component
            v-for="bookmark in bookmarksStore.bookmarks"
            :key="bookmark.videoId"
            :item="bookmark"
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
