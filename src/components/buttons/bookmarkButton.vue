<script setup lang="ts">
import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/vue/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/vue/24/solid'
import IconButton from '@/components/buttons/iconButton.vue'
import { DownloadItem } from '@/types/DownloadItem'
import { toRaw } from 'vue'
import { useBookmarksStore } from '@/stores/bookmarksStore'
import { useSearchStore } from '@/stores/searchStore'

const props = defineProps<{
  item: DownloadItem
}>()

// when downloaded remove the video from Bookmarks as it is added to history
// when getting the formats for a video check if each exists in bookmarks based on the uniqueId(title, videoId, audioId)
const bookmarksStore = useBookmarksStore()
const searchStore = useSearchStore()

const addBookmarkItem = async (): Promise<void> => {
  try {
    const removed = await bookmarksStore.add(toRaw(props.item))

    if (removed) {
      searchStore.updateResult(props.item.uniqueId, { isBookmarked: false })
    } else {
      searchStore.updateResult(props.item.uniqueId, { isBookmarked: true })
    }
  } catch (e) {
    console.error('addBookmark', e)
  }
}
</script>

<template>
  <icon-button @click="addBookmarkItem">
    <BookmarkSolidIcon v-if="props.item.isBookmarked" class="size-5" />
    <BookmarkOutlineIcon v-else class="size-5" />
  </icon-button>
</template>

<style scoped></style>
