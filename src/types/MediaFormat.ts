import { DownloaderOptions } from '@/types/DownloaderOptions'
import { HttpHeaders } from '@/types/HttpHeaders'
import { Fragment } from '@/types/Fragment'

export interface MediaFormat {
  format_id: string
  format_note?: string | null
  ext: string
  protocol: string

  acodec?: string | null
  vcodec?: string | null

  url: string
  manifest_url?: string | null

  width?: number | null
  height?: number | null
  fps?: number | null

  rows?: number | null
  columns?: number | null
  fragments?: Fragment[]

  audio_ext?: string | null
  video_ext?: string | null

  vbr?: number | null
  abr?: number | null
  tbr?: number | null

  resolution?: string | null
  aspect_ratio?: number | null

  filesize?: number | null
  filesize_approx?: number | null

  language?: string | null
  language_preference?: number | null
  dynamic_range?: string | null

  preference?: number | null
  format_index?: number | null

  quality?: number | null
  has_drm?: boolean | null
  source_preference?: number | null
  available_at?: number | null

  asr?: number | null
  audio_channels?: number | null

  container?: string | null
  downloader_options?: DownloaderOptions | null

  http_headers?: HttpHeaders | Record<string, string>

  format?: string | null
}
