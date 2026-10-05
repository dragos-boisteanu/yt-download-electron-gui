// eslint-disable-next-line @typescript-eslint/no-require-imports
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('bridge', {
  getVideoInfo: (url: string) => ipcRenderer.invoke('getVideoInfo', url),
  setYtDlpPath: () => ipcRenderer.invoke('setYtDlpPath'),
  getYtDlpPath: () => ipcRenderer.invoke('getYtDlpPath'),

  downloadVideo: (url: string, videoFormatId: string, audioFormatId: string) =>
    ipcRenderer.send('downloadVideo', { url, videoFormatId, audioFormatId }),

  onDownloadProgress: (callback: (progressUpdate: any) => void) => {
    const listener = (_event: any, data: any) => callback(data)

    ipcRenderer.on('downloadProgress', listener)

    return () => {
      ipcRenderer.removeListener('downloadProgress', listener)
    }
  },

  closeApp: (): void => ipcRenderer.send('closeApp'),
  minimize: (): void => ipcRenderer.send('minimize'),
  toggleFullScreen: (currentState: boolean): void =>
    ipcRenderer.send('toggleFullScreen', currentState),

  on: (type: string, callback: (data: any) => void) => {
    const listener = (_event: any, data: any) => callback(data)

    ipcRenderer.on(type, listener)

    // Return a cleanup function to prevent memory leaks
    return () => {
      ipcRenderer.removeListener(type, listener)
    }
  },
})
