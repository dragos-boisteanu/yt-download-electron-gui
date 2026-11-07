<script setup lang="ts">
import { ArrowDownOnSquareIcon } from '@heroicons/vue/24/outline'
import IconButton from '@/components/buttons/iconButton.vue'
import { useDownloadStore } from '@/stores/downloadStore'

const downloadStore = useDownloadStore()

const props = defineProps<{
  url: string
  videoId: string
  audioId: string
  uniqueId: string
  title: string
}>()

const download = () => {
  if (!props.videoId || !props.url || !props.audioId) {
    return
  }

  downloadStore.startDownload({
    url: props.url,
    videoId: props.videoId,
    audioId: props.audioId,
    uniqueId: props.uniqueId,
    title: props.title,
  })
}
</script>

<template>
  <icon-button @click="download" :disabled="downloadStore.isDownloading">
    <ArrowDownOnSquareIcon class="size-4" />
  </icon-button>
</template>

<style scoped></style>
