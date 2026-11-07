export default (totalSeconds: number) => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00'

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  // Helper to ensure numbers are always 2 digits (e.g., 5 -> "05")
  const pad = (num) => String(num).padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`
  }

  return `${minutes}:${pad(seconds)}`
}
