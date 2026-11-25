import { defineStore } from 'pinia'
import { DownloadItem } from '@/types/DownloadItem'
import { ref } from 'vue'
import { get, update } from 'idb-keyval'

export const useBookmarksStore = defineStore('bookmarksStore', () => {
  const bookmarks = ref<DownloadItem[]>([])

  const add = async (item: DownloadItem) => {
    try {
      let removed = false

      await update('bookmarks', (value) => {
        if (value) {
          const bookmarkIndex = value.findIndex((b: DownloadItem) => b.uniqueId === item.uniqueId)

          if (bookmarkIndex === -1) {
            item.isBookmarked = true
            value.push(item)
          } else {
            value.splice(bookmarkIndex, 1)
          }
        } else {
          const bookmarks: DownloadItem[] = []
          bookmarks.push(item)

          value = bookmarks
        }

        return value
      })

      const bookmarkIndex = bookmarks.value.findIndex(
        (b: DownloadItem) => b.uniqueId === item.uniqueId,
      )
      if (bookmarkIndex === -1) {
        item.isBookmarked = true
        bookmarks.value.push(item)
      } else {
        removed = true
        bookmarks.value.splice(bookmarkIndex, 1)
      }

      return removed
    } catch (error) {
      throw error
    }
  }

  const remove = async (uniqueId: string) => {
    try {
      await update('bookmarks', (value: []): any => {
        const bookmarkIndex = value.findIndex((b: DownloadItem) => b.uniqueId === uniqueId)
        if (bookmarkIndex === -1) {
          return value
        }

        return value.toSpliced(bookmarkIndex, 1)
      })

      const bookmarkIndex = bookmarks.value.findIndex((b: DownloadItem) => b.uniqueId === uniqueId)
      if (bookmarkIndex === -1) {
        return
      }

      bookmarks.value.splice(bookmarkIndex, 1)
    } catch (error) {
      throw error
    }
  }

  const checkItem = (uniqueId: string) => {
    return bookmarks.value.findIndex((b: DownloadItem) => b.uniqueId === uniqueId) > -1
  }

  const getBookmarks = async () => {
    try {
      const savedBookmarks: DownloadItem[] = await get('bookmarks')
      if (savedBookmarks) {
        bookmarks.value = savedBookmarks
      }
    } catch (error) {
      console.error('getBookmarks', error)
    }
  }

  getBookmarks()

  return {
    bookmarks,
    add,
    remove,
    checkItem,
  }
})
