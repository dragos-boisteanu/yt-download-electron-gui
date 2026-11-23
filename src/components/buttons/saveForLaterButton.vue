<script setup lang="ts">
import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/vue/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/vue/24/solid'
import IconButton from '@/components/buttons/iconButton.vue'
import { useHistoryStore } from '@/stores/history'
import { DownloadItem } from '@/types/DownloadItem'
import { toRaw } from 'vue'

const props = defineProps<{
  item: DownloadItem
}>()

//TODO: create a new store: Bookmarks
// save this videos there instead of history
// when downloaded remove the video from Bookmarks as it is added to history
// when getting the formats for a video check if each exists in bookmarks based on the uniqueId(title, videoId, audioId)
const historyStore = useHistoryStore()

const addToHistory = () => {
  historyStore.add(toRaw(props.item))
}
</script>

<template>
  <icon-button @click="addToHistory">
    <BookmarkSolidIcon v-if="props.item.isHistory" class="size-5" />
    <BookmarkOutlineIcon v-else class="size-5" />
  </icon-button>
</template>

<style scoped></style>
