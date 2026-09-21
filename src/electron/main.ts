import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import * as fs from 'node:fs'
import { VideoInfo } from '@/types/VideoInfo'
import { YtDlpProgress } from '@/types/YtDlpProgress'

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

let lastReportedPercentage = -1
let currentPhase = 'downloading-video' // starts with video

ipcMain.on('downloadVideo', (event, payload) => {
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

    // 1. Check if we reached the Merging phase
    if (output.includes('[Merger]')) {
      currentPhase = 'merging'
      console.log(
        JSON.stringify({
          status: currentPhase,
          message: 'Combining video and audio... please wait.',
        }),
      )
      return // Exit early so we don't try to parse percentages
    }

    // 2. Parse download progress
    const progressRegex =
      /\[download\]\s+([\d\.]+)%\s+of\s+([^\s]+)\s+at\s+([^\s]+)\s+ETA\s+([^\s]+)/
    const match = output.match(progressRegex)

    if (match) {
      const rawPercentage = parseFloat(match[1])
      const size = match[2]
      const speed = match[3]
      const eta = match[4]

      // 3. Detect transition from Video to Audio
      // If the percentage suddenly drops from near 100% back to near 0%, the audio track started
      if (lastReportedPercentage >= 95 && rawPercentage < 5) {
        currentPhase = 'downloading-audio'
      }

      const currentFloor = Math.floor(rawPercentage)

      // Only output if the whole number percentage changed (throttling)
      if (currentFloor !== lastReportedPercentage) {
        lastReportedPercentage = currentFloor

        const progressData = {
          status: currentPhase,
          percentage: rawPercentage,
          size: size,
          speed: speed,
          eta: eta,
        }

        // console.log(JSON.stringify(progressData))

        // In Electron, send this via IPC:
        event.sender.send('downloadProgress', progressData)
      }
    }
  })

  process.on('close', (code) => {
    const progressData: YtDlpProgress = {
      status: 'completed',
      message: '',
    }
    if (code === 0) {
      progressData.status = 'completed'
      progressData.message = 'Download and merge successful!'
    } else {
      progressData.status = 'completed'
      progressData.message = `Process exited with code ${code}`
    }

    // Reset trackers for the next download
    lastReportedPercentage = -1
    currentPhase = 'downloading-video'

    event.sender.send('downloadProgress', progressData)
  })
})
