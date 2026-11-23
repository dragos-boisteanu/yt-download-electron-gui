<script setup lang="ts">
import { BookmarkIcon } from '@heroicons/vue/24/outline'
import IconButton from '@/components/buttons/iconButton.vue'
import { useHistoryStore } from '@/stores/history'
import { DownloadItem } from '@/types/DownloadItem'
import { toRaw } from 'vue'

const props = defineProps<{
  item: DownloadItem
}>()

const historyStore = useHistoryStore()

const addToHistory = () => {
  historyStore.add(toRaw(props.item))
}
</script>

<template>
  <icon-button @click="addToHistory">
    <BookmarkIcon class="size-5" />
  </icon-button>
</template>

<style scoped></style>
