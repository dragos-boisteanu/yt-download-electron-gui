import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notificationStore', () => {
  const canShowNotification = ref<boolean>(true)
  let uniqueId: number = 0

  const showNotification = (title: string, body: string, fileName: string, formatId?: string) => {
    const bridge = (window as any).bridge
    if (!bridge) {
      return
    }

    if (!formatId) {
      formatId = (uniqueId++).toString()
    }

    console.log('showNotification', title, title, body, formatId)

    bridge.showNotification({
      title,
      body,
      tag: `download-ready-${formatId}-${Math.floor(new Date().getTime()) / 1000}`,
      fileName: fileName,
    })
  }

  return {
    canShowNotification,
    showNotification,
  }
})
