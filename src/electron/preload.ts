// eslint-disable-next-line @typescript-eslint/no-require-imports
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('bridge', {
  getVideoInfo: (url: string) => ipcRenderer.invoke('get-video-info', url),
})
