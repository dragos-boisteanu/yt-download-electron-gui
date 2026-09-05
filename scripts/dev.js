import { createServer } from 'vite'
import { spawn } from 'child_process'
import electronPath from 'electron'
import fs from 'node:fs'
import path from 'node:path'

let electronProcess = null

function launchElectron(devUrl) {
  if (electronProcess) {
    electronProcess.kill()
  }

  electronProcess = spawn(String(electronPath), ['.'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: devUrl,
    },
  })

  electronProcess.on('close', (code) => {
    // If process exited cleanly via user closing window, exit script
    if (code !== null) {
      process.exit()
    }
  })
}

async function startDev() {
  // 1. Start Vite Dev Server
  const server = await createServer({
    configFile: './vite.config.ts',
  })
  await server.listen()

  const address = server.httpServer.address()
  const devUrl = typeof address === 'string' ? address : `http://localhost:${address.port}`

  console.log(`[Vite] Dev server ready at ${devUrl}`)

  // 2. Launch initial Electron process
  launchElectron(devUrl)

  // 3. Watch dist/electron directory for changes made by tsc -w
  const watchDir = path.resolve('dist/electron')
  if (fs.existsSync(watchDir)) {
    let debounceTimer
    fs.watch(watchDir, { recursive: true }, () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        console.log('[Electron] File changes detected in main process. Restarting Electron...')
        launchElectron(devUrl)
      }, 300)
    })
  }
}

startDev()
