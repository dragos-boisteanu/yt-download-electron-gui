import { VideoDetails } from '@/types/VideoDetails'
import { MediaFormat } from '@/types/MediaFormat'

export interface DownloadsHistory {
  videoDetails: VideoDetails
  audioFormat?: MediaFormat
  videoFormat: MediaFormat
}
