export default (bytes: number | null | undefined): string => {
  if (bytes === 0) return '0 MB'
  if (!bytes || isNaN(bytes)) return 'Unknown size'

  // 1 MB = 1024 * 1024 bytes (1,048,576)
  const sizeInMB = bytes / (1024 * 1024)

  // .toFixed(2) keeps exactly two decimal places
  return `${sizeInMB.toFixed(2)} MB`
}
