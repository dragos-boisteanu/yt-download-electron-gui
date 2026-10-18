import { defineStore } from 'pinia'
import { DownloadsHistory } from '@/types/DownloadsHistory'
import { ref } from 'vue'
import { get, update } from 'idb-keyval'
import { VideoDetails } from '@/types/VideoDetails'
import { MediaFormat } from '@/types/MediaFormat'

export const useHistoryStore = defineStore('historyStore', () => {
  const history = ref<DownloadsHistory[]>([])


  const add = async (videoDetails: VideoDetails, audioFormat: MediaFormat, videoFormat: MediaFormat) => {
    try {
      const newHistoryEntry: DownloadsHistory = {
        videoDetails,
        audioFormat,
        videoFormat,
      }

     await update('downloadsHistory', (value) => {
        if (value) {
          const entryIndex = value.findIndex(
            (entry: DownloadsHistory) =>
              entry.videoDetails.url === newHistoryEntry.videoDetails.url,
          )

          if (entryIndex === -1) {
            value.push(newHistoryEntry)
          } else {
            value.splice(entryIndex, 1, newHistoryEntry)
          }
        } else {
          const history: DownloadsHistory[] = []
          history.push(newHistoryEntry)

          value = history
        }

        return value
      })


      const entryIndex = history.value.findIndex(
        (entry: DownloadsHistory) => entry.videoDetails.url === newHistoryEntry.videoDetails.url,
      )

      if (entryIndex === -1) {
        history.value.push(newHistoryEntry)
      } else {
        history.value.splice(entryIndex, 1, newHistoryEntry)
      }


    } catch (error) {
      throw error
    }
  }

  const remove = async (formatId: string) => {
    try {
      await update('downloadsHistory', (values) => {
        const formatIndex = values.findIndex(
          (v: DownloadsHistory) => v.videoFormat.format_id === formatId,
        )

        if (formatIndex === -1) {
          return values
        }

        return values.toSpliced(formatIndex, 1)
      })

      const formatIndex = history.value.findIndex(
        (v: DownloadsHistory) => v.videoFormat.format_id === formatId,
      )

      if (formatIndex > -1) {
        history.value.splice(formatIndex,1)
      }
    } catch (error) {
      throw error
    }
  }

  const getHistory = async () => {
    try {
      const downloads = await get('downloadsHistory')

      if (downloads) {
        history.value = downloads
      }
    } catch (error) {
      console.error('getHistory', error)
    }
  }
  getHistory()

  return {
    history,
    add,
    remove
  }
})
