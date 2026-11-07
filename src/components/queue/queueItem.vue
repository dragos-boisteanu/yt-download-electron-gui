<script setup lang="ts">
import { QueueItem } from '@/types/QueueItemInterface'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useQueueStore } from '@/stores/queue'

const props = defineProps<{
  item: QueueItem
}>()

const queueStore = useQueueStore()
const removeFromQueue = () => {
  queueStore.remove(props.item.uniqueId)
}
</script>

<template>
  <div
    class="flex w-full max-w-96 flex-wrap items-center gap-1 border-b border-b-neutral-200 bg-transparent p-2 last-of-type:border-b-0"
  >
    <div class="flex min-w-48 flex-1 items-center gap-x-4">
      <div class="h-14 w-20 rounded-lg bg-zinc-500">
        <img
          class="size-full rounded-lg object-cover"
          :src="props.item.thumbnail ? props.item.thumbnail : ''"
        />
      </div>

      <div class="flex min-w-0 flex-1 items-center gap-x-4">
        <div class="flex min-w-0 flex-1 flex-col justify-start gap-y-0.5">
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
          <div class="flex items-center gap-x-2">
            <div
              class="w-20 rounded-md border border-orange-100 bg-orange-50 px-1 py-0.5 text-center text-xs text-orange-700"
            >
              {{ props.item.resolution }}
            </div>
            <div
              class="w-12 justify-center rounded-md bg-slate-100 px-1 py-0.5 text-center text-xs font-bold text-slate-600"
            >
              {{ props.item.codec }}
            </div>
          </div>
        </div>
      </div>

      <button
        @click="removeFromQueue"
        class="inset-shadow cursor-pointer self-center rounded-full p-2 transition-colors ease-in-out hover:bg-zinc-100 active:bg-zinc-200"
      >
        <XMarkIcon class="size-4"></XMarkIcon>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
