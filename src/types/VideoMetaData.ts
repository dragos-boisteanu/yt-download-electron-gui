import { MediaFormat } from '@/types/MediaFormat'

export interface VideoMetaData {
  id: string
  title: string
  formats: MediaFormat[]
}
