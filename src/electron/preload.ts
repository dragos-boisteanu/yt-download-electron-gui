// eslint-disable-next-line @typescript-eslint/no-require-imports
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('bridge', {
  getVideoInfo: (url: string) => ipcRenderer.invoke('getVideoInfo', url),
  downloadVideo: (url: string, videoFormatId: string, audioFormatId: string) =>
    ipcRenderer.send('downloadVideo', { url, videoFormatId, audioFormatId }),

  onDownloadProgress: (callback: (progressUpdate: any) => void) => {
    const listener = (_event: any, data: any) => callback(data)

    ipcRenderer.on('downloadProgress', listener)

    return () => {
      ipcRenderer.removeListener('downloadProgress', listener)
    }
  },
})
