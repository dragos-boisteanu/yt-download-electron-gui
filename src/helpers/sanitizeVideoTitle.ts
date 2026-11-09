export default (title: string): string =>
  title
    .replace(/[:：/\\?*|<>"]/g, '-') // Replaces colons, slashes, question marks, quotes, pipes, etc. with a dash
    .trim() // Removes leading/trailing whitespace
    .replace(/\.+$/, '') // Removes any trailing periods at the very end of the title
