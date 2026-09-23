import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import * as fs from 'node:fs'
import { VideoInfo } from '@/types/VideoInfo'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function getBinaryPath() {
  const isWin = process.platform === 'win32'
  const binaryName = isWin ? 'yt-dlp.exe' : 'yt-dlp'

  let binaryPath

  if (app.isPackaged) {
    // Production (packaged app): Extra resources folder
    binaryPath = path.join(process.resourcesPath, 'bin', binaryName)
  } else {
    // Development mode: Point directly relative to root package directory
    // Handles single binary inside root/bin/
    const projectRoot = app.getAppPath()

    // Check root/bin/yt-dlp.exe first
    binaryPath = path.join(projectRoot, 'bin', binaryName)

    // Optional fallback if using subfolders like root/bin/win/yt-dlp.exe
    if (!fs.existsSync(binaryPath)) {
      const platformFolder = isWin ? 'win' : process.platform === 'darwin' ? 'mac' : 'linux'
      binaryPath = path.join(projectRoot, 'bin', platformFolder, binaryName)
    }
  }

  // Diagnostic check
  if (!fs.existsSync(binaryPath)) {
    console.error(`[yt-dlp Error] Expected binary at: ${binaryPath}`)
    throw new Error(`yt-dlp binary missing at path: ${binaryPath}`)
  }

  // Set executable permissions for macOS/Linux
  if (!isWin) {
    try {
      fs.chmodSync(binaryPath, '755')
    } catch (err: any) {
      console.warn('Failed to set executable permissions:', err.message)
    }
  }

  return binaryPath
}

const createMainWindow = () => {
  const window = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 480,
    minHeight: 680,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  const devServerUrl = process.env.VITE_DEV_SERVER_URL

  if (devServerUrl) {
    window.loadURL(devServerUrl)
  } else {
    window.loadFile(path.join(__dirname, '../index.html'))
  }
}

app.whenReady().then(createMainWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('getVideoInfo', async (event, url): Promise<VideoInfo> => {
  return new Promise((resolve, reject) => {
    const binary = getBinaryPath()
    const ytdlp = spawn(binary, ['--dump-json', '--no-playlist', url])

    let rawData = ''
    let errorData = ''

    ytdlp.stdout.on('data', (data) => {
      rawData += data.toString()
    })
    ytdlp.stderr.on('data', (data) => {
      errorData += data.toString()
    })

    ytdlp.on('close', (code) => {
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

const downloadsFolder = app.getPath('downloads')
const outputTemplate = path.join(downloadsFolder, '%(title)s.%(ext)s')

ipcMain.on('downloadVideo', (event, payload) => {
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

  const binary = getBinaryPath()
  const process = spawn(binary, args)

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
