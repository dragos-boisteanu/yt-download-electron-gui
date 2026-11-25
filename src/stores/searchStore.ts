import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DownloadItem } from '@/types/DownloadItem'
import { VideoInfo } from '@/types/VideoInfo'
import { MediaFormat } from '@/types/MediaFormat'
import getFriendlyCodecName from '@/helpers/getFriendlyCodecName'
import getVideoUniqueId from '@/helpers/getVideoUniqueId'
import formatSeconds from '@/helpers/formatSeconds'
import formatBytesToMB from '@/helpers/formatBytesToMB'
import formatFileName from '@/helpers/formatFileName'
import { useBookmarksStore } from '@/stores/bookmarksStore'

export const useSearchStore = defineStore('searchStore', () => {
  const results = ref<DownloadItem[]>([])

  const isSearching = ref<boolean>(false)

  const bookmarksStore = useBookmarksStore()

  const search = async (url: string): Promise<void> => {
    try {
      const regex =
        /^https:\/\/www\.youtube\.com\/(?:shorts\/[a-zA-Z0-9_-]+|watch\?v=[a-zA-Z0-9_-]+)/
      if (!regex.test(url)) {
        throw new Error('You must specify a valid video url')
      }

      const bridge = (window as any).bridge
      if (!bridge) {
        throw new Error('Electron bridge not found')
      }

      isSearching.value = true

      const info: VideoInfo = await bridge.getVideoInfo(url)

      console.log('info', JSON.stringify(info, null, 2))
      if (!info) {
        throw new Error('No video info')
      }

      if (!info.formats) {
        throw new Error('No formats')
      }

      const audioFormats = info.formats.filter((format) => format.audio_ext !== 'none')
      const bestAudioFormat = getAudioFormats(audioFormats)

      const videoFormats = info.formats.filter(
        (format) => format.video_ext !== 'none' && format.filesize,
      )

      results.value = parseVideoFormats(
        videoFormats,
        bestAudioFormat.format_id,
        info.title,
        url,
        info.duration,
        info.thumbnail,
      )
    } catch (error) {
      throw error
    } finally {
      isSearching.value = false
    }
  }

  // TODO: make a list of (low, medium, high)
  // add the list to each video
  // the user can select what format they want
  // highest is default
  const getAudioFormats = (formats: MediaFormat[]): MediaFormat | null => {
    return formats.at(-1)
  }

  const parseVideoFormats = (
    formats: MediaFormat[],
    bestAudioFormatId: string,
    title: string,
    url: string,
    duration: number,
    thumbnail: string,
  ): DownloadItem[] => {
    return formats
      .sort((a: MediaFormat, b: MediaFormat) => {
        // Primary: Compare height (e.g., 2400 vs 1080)
        const heightA = a.height ?? 0
        const heightB = b.height ?? 0
        if (heightB !== heightA) {
          return heightB - heightA // Higher height first
        }

        // Secondary fallback: Compare FPS (e.g., 60fps vs 30fps)
        const fpsA = a.fps ?? 0
        const fpsB = b.fps ?? 0
        return fpsB - fpsA // Higher FPS first
      })
      .map((format): DownloadItem => {
        const codec = getFriendlyCodecName(format.vcodec)
        const uniqueId = getVideoUniqueId(title, format.format_id, bestAudioFormatId)

        const isBookmarked = bookmarksStore.checkItem(uniqueId)
        const hdr = format.dynamic_range.toLocaleLowerCase().includes('hdr')

        return {
          videoId: format.format_id,
          audioId: bestAudioFormatId,
          url,
          codec,
          duration: formatSeconds(duration),
          size: formatBytesToMB(format.filesize),
          resolution: format.resolution,
          thumbnail: thumbnail,
          title,
          fileName: formatFileName(title, format.resolution, codec, format.fps, hdr),
          uniqueId,
          isBookmarked,
          fps: format.fps,
          hdr,
        }
      })
  }

  const updateResult = (uniqueId: string, payload: Partial<DownloadItem>) => {
    const resultIndex = results.value.findIndex(
      (entry: DownloadItem) => entry.uniqueId === uniqueId,
    )
    if (resultIndex === -1) {
      return
    }

    results.value = results.value.map((item: DownloadItem, index: number) =>
      index === resultIndex ? { ...item, ...payload } : item,
    )
  }

  return {
    results,
    isSearching,
    search,
    updateResult,
  }
})
