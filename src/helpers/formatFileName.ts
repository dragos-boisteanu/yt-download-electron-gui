export default (title: string, resolution: string, codec: string, fps: number, hdr: boolean) => {
  return `${title}_${resolution}_${fps}_${codec}_${hdr ? 'hdr' : ''}`
}
