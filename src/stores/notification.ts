import { defineStore } from 'pinia'
import { ref } from 'vue'
import { NotificationPayload } from '@/types/NotificationPayload'

export const useNotificationStore = defineStore('notificationStore', () => {
  const canShowNotification = ref<boolean>(true)
  let uniqueId: number = 0

  const showNotification = (payload: NotificationPayload) => {
    const bridge = (window as any).bridge
    if (!bridge) {
      return
    }

    if (!payload.uniqueId) {
      payload.uniqueId = (uniqueId++).toString()
    }

    if (payload.openApp) {
      payload.tag = `download-started-${payload.uniqueId}-${Math.floor(new Date().getTime()) / 1000}`
    } else {
      payload.tag = `download-ready-${payload.uniqueId}-${Math.floor(new Date().getTime()) / 1000}`
    }

    bridge.showNotification(payload)
  }

  return {
    canShowNotification,
    showNotification,
  }
})
