import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { QueueItem } from '@/types/QueueItemInterface'

export const useQueueStore = defineStore('queueStore', () => {
  const list = ref<QueueItem[]>([])
  const hasItems = computed(() => list.value.length > 0)

  const add = (download: QueueItem): void => {
    list.value.push(download)
  }

  const remove = (itemId: string): void => {
    const itemIndex = list.value.findIndex((e) => e.uniqueId === itemId)
    if (itemIndex === -1) {
      return
    }

    list.value.splice(itemIndex, 1)
  }

  const getNextItem = (): QueueItem | undefined => {
    if (list.value.length === 0) {
      return
    }

    return list.value.shift()
  }

  return {
    list,
    hasItems,
    add,
    remove,
    getNextItem,
  }
})
