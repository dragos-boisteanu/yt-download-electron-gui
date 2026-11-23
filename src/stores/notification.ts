import { defineStore } from 'pinia'
import { ref } from 'vue'
import { NotificationPayload } from '@/types/NotificationPayload'

export const useNotificationStore = defineStore('notificationStore', () => {
  const canShowNotification = ref<boolean>(true)

  const showNotification = (payload: NotificationPayload) => {
    const bridge = (window as any).bridge
    if (!bridge) {
      return
    }

    bridge.showNotification(payload)
  }

  return {
    canShowNotification,
    showNotification,
  }
})
