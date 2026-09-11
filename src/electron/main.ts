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

ipcMain.handle('get-video-info', async (event, url): Promise<VideoInfo> => {
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
