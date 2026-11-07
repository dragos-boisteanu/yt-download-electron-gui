export interface NotificationPayload {
  title: string
  body: string
  uniqueId?: string
  openApp?: boolean
  openFolder?: boolean
  fileName?: string
  tag?: string
}
