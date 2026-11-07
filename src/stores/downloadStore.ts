import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import { YtDlpProgress } from '@/types/YtDlpProgress'
import { useNotificationStore } from '@/stores/notification'
import { useQueueStore } from '@/stores/queue'
import { useHistoryStore } from '@/stores/history'
import { DownloadItem } from '@/types/DownloadItem'

export const useDownloadStore = defineStore('downloadStore', () => {
  const percentage = ref<number>(0)
  const downloadState = ref<string>('')
  const isDownloading = ref<boolean>(false)

  const notificationStore = useNotificationStore()
  const queueStore = useQueueStore()
  const historyStore = useHistoryStore()

  const registerDownloadProgressListener = () => {
    const bridge = (window as any).bridge
    if (!bridge) {
      return
    }

    bridge.onDownloadProgress((progress: YtDlpProgress) => {
      if (progress.percentage !== undefined && progress.percentage > 0) {
        percentage.value = progress.percentage
      }

      if (progress.message) {
        downloadState.value = progress.message
      }

      //TODO: split this in multiple dedicate functions
      if (progress.status === 'completed' || progress.status === 'error') {
        isDownloading.value = false
        let title: string
        let body: string

        const isCompleted = progress.status === 'completed'

        if (notificationStore.canShowNotification) {
          if (isCompleted) {
            title = 'Video downloaded successfully.'
            body = `${progress.item.title} downloaded successfully.`
          } else {
            title = 'Download failed'
            body = `Failed to download ${progress.title}`
          }

          notificationStore.showNotification({
            openFolder: true,
            body,
            title,
            uniqueId: progress.item.uniqueId,
            fileName: progress.item.title,
          })
        }

        if (isCompleted) {
          historyStore
            .add(progress.item)
            .catch((error) => console.error('saveVideoToHistory', error))
        }

        if (queueStore.hasItems) {
          setTimeout(() => {
            const nextItem = queueStore.getNextItem()
            startDownload(toRaw(nextItem))

            // TODO: make dedicated setting for queened video download start
            /* if (notificationStore.canShowNotification) {
              notificationStore.showNotification({
                openApp: true,
                body: `Downloading ${nextItem.title}`,
                title: 'Next download started',
                uniqueId: progress.item.uniqueId,
              })
            }*/
          }, 1000)
        }
      }
    })
  }

  const startDownload = (payload: DownloadItem) => {
    const bridge = (window as any).bridge

    if (!bridge) {
      return
    }

    if (isDownloading.value) {
      queueStore.add({ ...payload, order: queueStore.list.length })
      return
    }

    isDownloading.value = true
    downloadState.value = 'Initiating...'
    percentage.value = 0

    //TODO: do something to reset app state if the download doesn't start
    bridge.downloadVideo(payload)
  }

  return {
    percentage,
    downloadState,
    isDownloading,

    registerDownloadProgressListener,
    startDownload,
  }
})
