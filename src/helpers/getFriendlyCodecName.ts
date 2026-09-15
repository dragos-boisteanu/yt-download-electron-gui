export default (rawCodec?: string | null): string => {
  if (!rawCodec || rawCodec === 'none') return 'Unknown'

  const codec = rawCodec.toLowerCase()

  // H.264 / AVC
  if (codec.includes('avc1') || codec.includes('h264')) {
    return 'H.264'
  }
  // AV1
  if (codec.includes('av01')) {
    return 'AV1'
  }
  // VP9
  if (codec.includes('vp9') || codec.includes('vp09')) {
    return 'VP9'
  }
  // Audio: AAC
  if (codec.includes('mp4a')) {
    return 'AAC'
  }
  // Audio: Opus
  if (codec.includes('opus')) {
    return 'Opus'
  }

  // Fallback if a new codec appears
  return rawCodec
}
