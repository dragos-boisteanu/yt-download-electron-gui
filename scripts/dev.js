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
    // If closed intentionally by exiting the window, exit script
    if (code !== null) {
      process.exit()
    }
  })
}

async function startDev() {
  // 1. Start Vite dev server
  const server = await createServer({
    configFile: './vite.config.ts',
  })
  await server.listen()

  const address = server.httpServer.address()
  const devUrl = typeof address === 'string' ? address : `http://localhost:${address.port}`

  console.log(`[Vite] Dev server ready at ${devUrl}`)

  // 2. Watch dist/electron directory for changes from tsc -w
  // The first compilation by tsc will trigger the initial window open
  const watchDir = path.resolve('dist/electron')
  let debounceTimer

  // Ensure directory exists to watch
  if (!fs.existsSync(watchDir)) {
    fs.mkdirSync(watchDir, { recursive: true })
  }

  // Initial launch
  // launchElectron(devUrl)

  // Watch for rebuilds with debouncing to prevent multi-fire on fast disk writes
  fs.watch(watchDir, { recursive: true }, (eventType, filename) => {
    // Only restart on actual file changes, avoiding initial creation loops
    if (filename && filename.endsWith('.js')) {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        console.log('[Electron] Rebuilding main process...')
        launchElectron(devUrl)
      }, 500)
    }
  })
}

startDev()
