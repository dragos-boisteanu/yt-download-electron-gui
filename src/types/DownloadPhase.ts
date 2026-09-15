export type DownloadPhase =
  | 'downloading-video'
  | 'downloading-audio'
  | 'merging'
  | 'completed'
  | 'error'
  | 'already-downloaded'
