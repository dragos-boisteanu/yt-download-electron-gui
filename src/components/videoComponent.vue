<script setup lang="ts">
import { TrashIcon } from '@heroicons/vue/24/outline'
import { useHistoryStore } from '@/stores/history'
import DownloadVideoButton from '@/components/buttons/downloadVideoButton.vue'
import { DownloadItem } from '@/types/DownloadItem'
import { computed } from 'vue'

const historyStore = useHistoryStore()

const props = defineProps<{
  item: DownloadItem
  canDelete?: boolean
}>()

const removeHistoryItem = () => {
  historyStore
    .remove(props.item.videoId)
    .catch((error) => console.error('removeHistoryItem', error))
}
</script>

<template>
  <div
    class="my-2 flex w-full flex-wrap items-center gap-2 rounded-lg bg-zinc-50 p-2 shadow hover:shadow-lg"
  >
    <div class="flex min-w-96 flex-1 items-start gap-x-4">
      <button
        v-if="canDelete"
        @click="removeHistoryItem"
        class="inset-shadow cursor-pointer self-center rounded-full p-2 transition-colors ease-in-out hover:bg-zinc-100 active:bg-zinc-200"
      >
        <TrashIcon class="size-5"></TrashIcon>
      </button>

      <div class="h-16 w-26 rounded-lg bg-zinc-500">
        <img
          class="size-full rounded-lg object-cover"
          :src="props.item.thumbnail ? props.item.thumbnail : ''"
        />
      </div>

      <!-- Key fix: min-w-0 stops flex child from growing past wrapper -->
      <div class="flex min-w-0 flex-1 items-center gap-x-4">
        <!-- Key fix: min-w-0 + truncate or line-clamp -->
        <div class="flex min-w-0 flex-1 flex-col justify-start gap-y-0.5">
          <!-- Truncates to 1 line with ellipsis -->
          <div class="truncate text-sm font-semibold text-zinc-900">
            {{ props.item.title }}
          </div>
          <div class="flex items-center gap-x-2">
            <div class="text-xs text-zinc-900">
              <span class="pr-1 font-semibold">Duration:</span>
              <span> {{ props.item.duration }}</span>
            </div>
            <div class="text-xs text-zinc-900">
              <span class="pr-1 font-semibold">Size:</span>
              <span>{{ props.item.size }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex w-full items-center justify-between gap-4 md:w-fit">
      <div class="flex items-center gap-x-4">
        <div
          class="w-20 rounded-md border border-orange-100 bg-orange-50 px-2 py-1 text-center text-xs text-orange-700"
        >
          {{ props.item.resolution }}
        </div>

        <div
          class="w-12 justify-center rounded-md bg-slate-100 px-2 py-1 text-center text-xs font-bold text-slate-600"
        >
          {{ props.item.codec }}
        </div>
      </div>

      <download-video-button :item="props.item" />
    </div>
  </div>
</template>

<style scoped></style>
