<script setup lang="ts">
import TogglerComponent from '@/components/settings/togglerComponent.vue'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()
</script>

<template>
  <div class="flex w-full items-center justify-between p-4">
    <div>
      <div class="font-semibold text-neutral-700">Download Notification</div>
      <div class="text-sm text-neutral-600">Notify when the download completes.</div>
    </div>

    <toggler-component v-model="notificationStore.canShowNotification" />
  </div>
</template>

<style scoped></style>
