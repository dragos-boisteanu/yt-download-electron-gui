export interface DownloadItem {
  videoId: string
  audioId: string
  title: string
  fileName: string
  duration: string
  url: string
  resolution: string
  codec: string
  size: string
  fps: number
  hdr: boolean
  thumbnail: string
  uniqueId: string
  isHistory?: boolean
  isDownloadedCompleted?: boolean
  isBookmarked?: boolean
  fileDeleted?: boolean
}
