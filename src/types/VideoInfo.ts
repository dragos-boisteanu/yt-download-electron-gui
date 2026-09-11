import { MediaFormat } from '@/types/MediaFormat'
import { Thumbnail } from '@/types/Thumbnail'
import { CaptionTrack } from '@/types/CaptionTrack'
import { ExtractorVersion } from '@/types/ExtractorVersion'
export interface VideoInfo {
  id: string
  title: string
  formats?: MediaFormat[]
  thumbnails?: Thumbnail[]
  thumbnail?: string | null
  description?: string | null
  channel_id?: string | null
  channel_url?: string | null
  duration?: number | null
  view_count?: number | null
  average_rating?: number | null
  age_limit?: number | null
  webpage_url?: string | null
  categories?: string[]
  tags?: string[]
  playable_in_embed?: boolean | null
  live_status?: string | null
  media_type?: string | null
  release_timestamp?: number | null
  _format_sort_fields?: string[]
  automatic_captions?: Record<string, CaptionTrack[]>
  subtitles?: Record<string, CaptionTrack[]>
  comment_count?: number | null
  chapters?: unknown[] | null
  heatmap?: unknown[] | null
  location?: string | null
  like_count?: number | null
  channel?: string | null
  channel_follower_count?: number | null
  creators?: string[] | null
  uploader?: string | null
  uploader_id?: string | null
  uploader_url?: string | null
  upload_date?: string | null
  timestamp?: number | null
  availability?: string | null
  original_url?: string | null
  webpage_url_basename?: string | null
  webpage_url_domain?: string | null
  extractor?: string | null
  extractor_key?: string | null
  playlist?: string | null
  playlist_index?: number | null
  display_id?: string | null
  fulltitle?: string | null
  duration_string?: string | null
  release_year?: number | null
  is_live?: boolean | null
  was_live?: boolean | null
  requested_subtitles?: unknown | null
  _has_drm?: boolean | null
  epoch?: number | null
  requested_formats?: MediaFormat[]
  format?: string | null
  format_id?: string | null
  ext?: string | null
  protocol?: string | null
  language?: string | null
  format_note?: string | null
  filesize_approx?: number | null
  tbr?: number | null
  width?: number | null
  height?: number | null
  resolution?: string | null
  fps?: number | null
  dynamic_range?: string | null
  vcodec?: string | null
  vbr?: number | null
  stretched_ratio?: number | null
  aspect_ratio?: number | null
  acodec?: string | null
  abr?: number | null
  asr?: number | null
  audio_channels?: number | null
  _filename?: string | null
  filename?: string | null
  _type?: string | null
  _version?: ExtractorVersion
}
