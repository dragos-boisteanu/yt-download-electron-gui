import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { VideoInfo } from '@/types/VideoInfo'
import fs from 'node:fs'
import fsPromises from 'fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const YT_DLP_PATH_KEY = 'ytDlpPath'
const DEFAULT_CONFIG: Record<string, string> = {
  theme: 'system',
  ytDlpPath: '',
}

const dataPath = app.getPath('userData')
const configFilePath = path.join(dataPath, 'config.json')

async function writeConfigData(key: string, value: string | boolean) {
  const content = await parseConfigData()
  content[key] = value
  const tempFilePath = `${configFilePath}.tmp`
  const jsonString = JSON.stringify(content, null, 2)

  // Write to temp file first, then atomically replace actual file
  await fsPromises.writeFile(tempFilePath, jsonString, 'utf8')
  await fsPromises.rename(tempFilePath, configFilePath)
}

async function readConfigData(key: string): Promise<string | boolean | undefined> {
  const content = await parseConfigData()
  return content[key]
}

async function parseConfigData(): Promise<Record<string, string | boolean>> {
  if (!fs.existsSync(configFilePath)) {
    const dirPath = path.dirname(configFilePath)
    await fsPromises.mkdir(dirPath, { recursive: true })
    await fsPromises.writeFile(configFilePath, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf8')
    return { ...DEFAULT_CONFIG }
  }

  try {
    const dataFromFile = await fsPromises.readFile(configFilePath, 'utf8')
    return JSON.parse(dataFromFile)
  } catch (error) {
    console.error('Failed to parse config file, using defaults:', error)
    return { ...DEFAULT_CONFIG }
  }
}

let ytDlpPath: string = ''

try {
  const path = await readConfigData(YT_DLP_PATH_KEY)
  if (typeof path === 'string') {
    ytDlpPath = path
  }
} catch (error) {
  console.error(error)
}

let mainWindow: BrowserWindow | null = null
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 480,
    minHeight: 680,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  const devServerUrl = process.env.VITE_DEV_SERVER_URL

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../index.html'))
  }

  mainWindow.webContents.openDevTools()

  mainWindow.on('maximize', () => {
    if (!mainWindow) {
      return
    }

    mainWindow.webContents.send('app', {
      action: 'maximize',
    })
  })

  mainWindow.on('unmaximize', () => {
    if (!mainWindow) {
      return
    }

    mainWindow.webContents.send('app', {
      action: 'unmaximize',
    })
  })
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.whenReady().then(createMainWindow)
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('getVideoInfo', async (event, url): Promise<VideoInfo> => {
  return new Promise((resolve, reject) => {
    if (!ytDlpPath) {
      //TODO: better handling case when ytDlpPath is not set
      reject('No path specified for yt-dlp')
    }

    const ytDlp = spawn(ytDlpPath, ['--dump-json', '--no-playlist', url])

    let rawData = ''
    let errorData = ''

    ytDlp.stdout.on('data', (data) => {
      rawData += data.toString()
    })
    ytDlp.stderr.on('data', (data) => {
      errorData += data.toString()
    })

    ytDlp.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(rawData))
        } catch (e) {
          reject(new Error('Failed to parse metadata JSON'))
        }
      } else {
        reject(new Error(errorData || `Process exited with code ${code}`))
      }
    })
  })
})

ipcMain.handle('setYtDlpPath', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Select yt-dl executable',
    properties: ['openFile'],
    filters: [{ name: 'exe', extensions: ['exe'] }],
  })

  // 1. User canceled or closed the dialog
  if (canceled || filePaths.length === 0) {
    return null
  }

  const selectedPath = filePaths[0]
  const fileName = path.basename(selectedPath).toLowerCase()

  // 2. Strict validation: Only return path if the selected file is yt-dlp.exe
  if (fileName === 'yt-dlp.exe' || 'yt-dlp_x86.exe') {
    writeConfigData(YT_DLP_PATH_KEY, selectedPath).catch((error) =>
      console.error('setYtDlpPath', error),
    )
    ytDlpPath = selectedPath
    return selectedPath
  }

  return null
})

ipcMain.handle('getYtDlpPath', () => ytDlpPath)

const downloadsFolder = app.getPath('downloads')
const outputTemplate = path.join(downloadsFolder, '%(title)s.%(ext)s')

ipcMain.on('downloadVideo', (event, payload) => {
  if (!ytDlpPath) {
    //TODO: better handling case when ytDlpPath is not set
    event.sender.send('downloadProgress', {
      status: 'error',
      message: `Download failed. The yt-dlp.exe path is not set`,
      percentage: 0,
    })

    return
  }

  let currentPhase = 'video' // 'video' | 'audio' | 'merging'
  let lastReportedRawPercentage = 0
  let lastReportedFloor = -1

  const formatSelection = `${payload.videoFormatId}+${payload.audioFormatId}` // e.g., "313+251"

  const args = [
    '-f',
    formatSelection,
    '--merge-output-format',
    'mp4',
    '-o',
    outputTemplate, // Tells yt-dlp exactly where to save it
    '--newline', // Forces output on new lines for easier parsing
    payload.url,
  ]

  const process = spawn(ytDlpPath, args)

  process.stdout.on('data', (data) => {
    const output = data.toString()

    // Detect Merging Phase (FFmpeg phase)
    if (output.includes('[Merger]')) {
      if (currentPhase !== 'merging') {
        currentPhase = 'merging'
        event.sender.send('downloadProgress', {
          status: 'processing',
          message: 'Combining video and audio... please wait.',
          percentage: 99,
          size: 'N/A',
          speed: 'N/A',
          eta: 'N/A',
        })
      }
      return
    }

    // Parse download progress lines
    const progressRegex =
      /\[download\]\s+([\d\.]+)%\s+of\s+([^\s]+)\s+at\s+([^\s]+)\s+ETA\s+([^\s]+)/
    const match = output.match(progressRegex)

    if (match) {
      const rawPercentage = parseFloat(match[1])
      const size = match[2]
      const speed = match[3]
      const eta = match[4]

      // Detect transition from Video (1st download) to Audio (2nd download)
      if (currentPhase === 'video' && lastReportedRawPercentage >= 90 && rawPercentage < 10) {
        currentPhase = 'audio'
      }
      lastReportedRawPercentage = rawPercentage

      // Map raw progress to a unified 0-98% scale
      let unifiedPercentage = 0
      let statusMessage = ''

      if (currentPhase === 'video') {
        unifiedPercentage = rawPercentage * 0.9 // Maps 0-100% -> 0-90%
        statusMessage = 'Downloading video (1/2)...'
      } else if (currentPhase === 'audio') {
        unifiedPercentage = 90 + rawPercentage * 0.08 // Maps 0-100% -> 90-98%
        statusMessage = 'Downloading audio (2/2)...'
      }

      const currentFloor = Math.floor(unifiedPercentage)

      // Throttle: Send IPC update only when whole number changes
      if (currentFloor !== lastReportedFloor) {
        lastReportedFloor = currentFloor

        event.sender.send('downloadProgress', {
          status: 'downloading',
          message: statusMessage,
          percentage: parseFloat(unifiedPercentage.toFixed(1)),
          size: size,
          speed: speed,
          eta: eta,
        })
      }
    }
  })

  process.on('close', (code) => {
    if (code === 0) {
      event.sender.send('downloadProgress', {
        status: 'completed',
        message: 'Download complete!',
        percentage: 100,
        size: 'N/A',
        speed: '0B/s',
        eta: '00:00',
      })
    } else {
      event.sender.send('downloadProgress', {
        status: 'error',
        message: `Download failed with exit code ${code}`,
        percentage: 0,
      })
    }
  })
})

ipcMain.on('closeApp', () => {
  app.quit()
})

ipcMain.on('minimize', () => {
  if (!mainWindow) {
    return
  }

  if (!mainWindow.minimizable) {
    return
  }

  mainWindow.minimize()
})

ipcMain.on('toggleFullScreen', (event: any, currentState: boolean) => {
  if (!mainWindow) {
    return
  }

  if (currentState) {
    mainWindow.unmaximize()
  } else {
    mainWindow.maximize()
  }
})
