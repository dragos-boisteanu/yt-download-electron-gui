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
  thumbnail: string
  uniqueId: string
  isHistory?: boolean
  isDownloadedCompleted?: boolean
  fileDeleted?: boolean
}
