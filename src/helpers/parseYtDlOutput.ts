import { YtDlpProgress } from '@/types/YtDlpProgress'
import { DownloadPhase } from '@/types/DownloadPhase'

export class YtDlpProgressTracker {
  private lastReportedPercentage: number = -1
  private currentPhase: DownloadPhase = 'downloading-video'
  private onUpdate: (progress: YtDlpProgress) => void

  /**
   * @param onUpdate Callback function that triggers whenever there is a UI-worthy update
   */
  constructor(onUpdate: (progress: YtDlpProgress) => void) {
    this.onUpdate = onUpdate
  }

  /**
   * Feed process.stdout data into this method
   */
  public processOutput(data: string | Buffer): void {
    const output = data.toString()

    // 1. Check if the file already exists
    if (output.includes('has already been downloaded')) {
      this.currentPhase = 'already-downloaded'
      this.onUpdate({
        status: this.currentPhase,
        message: 'This video has already been downloaded!',
      })
      return
    }

    // 1. Check for Merging Phase
    if (output.includes('[Merger]')) {
      this.currentPhase = 'merging'
      this.onUpdate({
        status: this.currentPhase,
        message: 'Combining video and audio... please wait.',
      })
      return
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
      if (this.lastReportedPercentage >= 95 && rawPercentage < 5) {
        this.currentPhase = 'downloading-audio'
      }

      const currentFloor = Math.floor(rawPercentage)

      // 4. Throttle updates to integer changes
      if (currentFloor !== this.lastReportedPercentage) {
        this.lastReportedPercentage = currentFloor

        this.onUpdate({
          status: this.currentPhase,
          percentage: rawPercentage,
          size,
          speed,
          eta,
        })
      }
    }
  }

  /**
   * Call this when the process emits the 'close' event
   */
  public handleClose(code: number | null): void {
    if (code === 0) {
      this.onUpdate({
        status: 'completed',
        message: 'Download and merge successful!',
      })
    } else {
      this.onUpdate({
        status: 'error',
        message: `Process exited with error code ${code}`,
      })
    }
  }
}
