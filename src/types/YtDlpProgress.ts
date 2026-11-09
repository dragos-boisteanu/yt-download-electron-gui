import { DownloadPhase } from '@/types/DownloadPhase'
import { DownloadItem } from '@/types/DownloadItem'

export interface YtDlpProgress {
  status: DownloadPhase
  percentage?: number
  size?: string
  speed?: string
  eta?: string
  message?: string
  uniqueId?: string
  title?: string
  item?: DownloadItem
}
