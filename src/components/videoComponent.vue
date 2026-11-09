<script setup lang="ts">
import { TrashIcon } from '@heroicons/vue/24/outline'
import { useHistoryStore } from '@/stores/history'
import DownloadVideoButton from '@/components/buttons/downloadVideoButton.vue'
import { DownloadItem } from '@/types/DownloadItem'
import IconButton from '@/components/buttons/iconButton.vue'
import { onMounted, ref } from 'vue'

const historyStore = useHistoryStore()

const props = defineProps<{
  item: DownloadItem
  canDelete?: boolean
  isHistory: false
}>()

const removeHistoryItem = () => {
  historyStore
    .remove(props.item.uniqueId)
    .catch((error) => console.error('removeHistoryItem', error))
}

//TODO: check for the file after the download is complete
//TODO: watch the file so when the users deletes it the app will react
const checkFile = async (): Promise<boolean> => {
  const bridge = (window as any).bridge
  if (!bridge) {
    return false
  }

  return await bridge.checkFile(props.item.title)
}

const fileExists = ref<boolean>(false)
onMounted(() => {
  checkFile().then((response: boolean) => {
    fileExists.value = response
  })
})

const openInFolder = () => {
  const bridge = (window as any).bridge
  if (!bridge) {
    return false
  }

  bridge.openInFolder(props.item.title)
}
</script>

<template>
  <div
    class="my-2 flex w-full flex-wrap items-center gap-x-2 rounded-lg bg-zinc-50 p-2 shadow hover:shadow-lg"
  >
    <icon-button v-if="canDelete" @click="removeHistoryItem" class="hidden md:block">
      <TrashIcon class="size-4"></TrashIcon>
    </icon-button>

    <div class="flex min-w-96 flex-1 items-center gap-x-3 md:items-start">
      <div class="flex w-full min-w-64 items-center gap-x-3 md:items-start">
        <div class="h-16 w-26 shrink-0 rounded-lg bg-zinc-500">
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

            <!-- Tags for small screens (right under duration, in line with image) -->
            <div class="flex items-center gap-x-2 pt-1 md:hidden">
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
          </div>
        </div>
      </div>
    </div>

    <!-- Tags for wide screens (near download button) + Download button -->
    <div class="flex w-full items-center justify-end gap-2 md:w-fit md:justify-between">
      <div class="hidden items-center gap-x-2 md:flex">
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

      <div class="flex items-center gap-x-2">
        <icon-button v-if="canDelete" @click="removeHistoryItem" class="block md:hidden">
          <TrashIcon class="size-4"></TrashIcon>
        </icon-button>

        <button
          v-if="fileExists && isHistory"
          @click="openInFolder"
          class="inset-shadow cursor-pointer self-center rounded-full p-2 transition-colors ease-in-out hover:bg-zinc-100 active:bg-zinc-200"
        >
          <FolderOpenIcon class="size-5" />
        </button>
        <download-video-button v-else :item="props.item" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
