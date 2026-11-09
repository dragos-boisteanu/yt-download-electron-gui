import { DownloadItem } from '@/types/DownloadItem'

export interface QueueItem extends DownloadItem {
  order: number
}
