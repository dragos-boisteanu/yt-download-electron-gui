import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import { YtDlpProgress } from '@/types/YtDlpProgress'
import { useNotificationStore } from '@/stores/notification'
import { DownloadPayload } from '@/types/DownloadPayload'

export const useDownloadStore = defineStore('downloadStore', () => {
  const percentage = ref<number>(0)
  const downloadState = ref<string>('')
  const isDownloading = ref<boolean>(false)

  const notificationStore = useNotificationStore()
  // const historyStore = useHistoryStore()

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

      if (progress.status === 'completed' || progress.status === 'error') {
        isDownloading.value = false

        if (notificationStore.canShowNotification) {
          let title: string
          let body: string

          if (progress.status === 'completed') {
            title = 'Video downloaded successfully.'
            body = `${progress.title} downloaded successfully.`

            //TODO: adapt history store to the new downloads logic
            // historyStore
            //   .add(toRaw(props.videoDetails), toRaw(props.audioFormat), toRaw(props.format))
            //   .catch((error: any) => console.error('saveDownloadVideoHistory', error))

            //TODO: if there is a video in queue begin downloading it
          } else {
            title = 'Download failed'
            body = `Failed to download ${progress.title}`
          }
          notificationStore.showNotification(title, body, progress.title || '', progress.uniqueId)
        }
      }
    })
  }

  const startDownload = (payload: DownloadPayload) => {
    const bridge = (window as any).bridge

    if (!bridge) {
      return
    }

    isDownloading.value = true
    downloadState.value = 'Initiating...'

    bridge.downloadVideo({
      url: payload.url,
      videoId: payload.videoId,
      audioId: payload.audioId,
      uniqueId: `${payload.videoId}:${payload.audioId}`,
      title: payload.title,
    })
  }

  return {
    percentage,
    downloadState,
    isDownloading,

    registerDownloadProgressListener,
    startDownload,
  }
})
