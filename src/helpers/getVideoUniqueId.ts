export default (title: string, videoId: string, audioId: string) =>
  `${title.toLocaleLowerCase().replaceAll(' ', '_')}:${videoId}:${audioId}`
