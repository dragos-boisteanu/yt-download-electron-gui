import { DownloadPhase } from '@/types/DownloadPhase'

export interface YtDlpProgress {
  status: DownloadPhase
  percentage?: number
  size?: string
  speed?: string
  eta?: string
  message?: string
}
