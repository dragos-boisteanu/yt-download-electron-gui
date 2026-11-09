<script setup lang="ts">
import { ArrowDownOnSquareIcon } from '@heroicons/vue/24/outline'
import IconButton from '@/components/buttons/iconButton.vue'
import { useDownloadStore } from '@/stores/downloadStore'
import { DownloadItem } from '@/types/DownloadItem'
import { toRaw } from 'vue'

const downloadStore = useDownloadStore()

const props = defineProps<{
  item: DownloadItem
}>()

const download = () => {
  downloadStore.startDownload(toRaw(props.item))
}
</script>

<template>
  <icon-button @click="download">
    <ArrowDownOnSquareIcon class="size-4" />
  </icon-button>
</template>

<style scoped></style>
