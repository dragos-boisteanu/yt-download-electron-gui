import { defineStore } from 'pinia'
import { ref } from 'vue'
import { get, update } from 'idb-keyval'
import { DownloadItem } from '@/types/DownloadItem'

export const useHistoryStore = defineStore('historyStore', () => {
  const history = ref<DownloadItem[]>([])

  const add = async (item: DownloadItem) => {
    try {
      await update('downloadsHistory', (value) => {
        if (value) {
          const entryIndex = value.findIndex(
            (entry: DownloadItem) => entry.uniqueId === item.uniqueId,
          )

          if (entryIndex === -1) {
            value.push(item)
          } else {
            value.splice(entryIndex, 1, item)
          }
        } else {
          const history: DownloadItem[] = []
          history.push(item)

          value = history
        }

        return value
      })

      const entryIndex = history.value.findIndex(
        (entry: DownloadItem) => entry.uniqueId === item.uniqueId,
      )

      if (entryIndex === -1) {
        history.value.push(item)
      } else {
        history.value.splice(entryIndex, 1, item)
      }
    } catch (error) {
      throw error
    }
  }

  const remove = async (uniqueId: string) => {
    try {
      await update('downloadsHistory', (values) => {
        const formatIndex = values.findIndex((item: DownloadItem) => item.uniqueId === uniqueId)

        if (formatIndex === -1) {
          return values
        }

        return values.toSpliced(formatIndex, 1)
      })

      const formatIndex = history.value.findIndex(
        (item: DownloadItem) => item.uniqueId === uniqueId,
      )

      if (formatIndex > -1) {
        history.value.splice(formatIndex, 1)
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
    remove,
  }
})
