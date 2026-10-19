<script setup lang="ts">
import { ref } from 'vue'
import { vRipple } from '@/directives/vRipple'

const downloadsPath = ref<string>('')

const openFilePicker = async () => {
  const bridge = (window as any).bridge
  if (!bridge) {
    return
  }

  const path = await bridge.setDownloadsPath()

  if (path) {
    downloadsPath.value = path
  }
}

const getDownloadsPath = async () => {
  const bridge = (window as any).bridge
  if (!bridge) {
    return
  }

  downloadsPath.value = await bridge.getDownloadsPath()
}

getDownloadsPath()
</script>

<template>
  <div class="flex w-full items-center justify-between p-4">
    <div>
      <div class="font-semibold text-neutral-700">Downloads location</div>
      <div class="text-sm text-neutral-600">Select where downloaded content will be saved.</div>
      <div v-if="downloadsPath" class="text-xs text-neutral-600">
        <span class="pr-1 font-semibold">Current path:</span>
        <span>{{ downloadsPath }}</span>
      </div>
    </div>

    <button
      v-ripple
      class="cursor-pointer rounded-full bg-neutral-200/80 px-4 py-1.5 text-sm font-medium text-neutral-800 transition-all duration-150 hover:bg-neutral-300 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 active:scale-95 active:bg-neutral-400/80"
      @click="openFilePicker()"
    >
      Browse...
    </button>
  </div>
</template>

<style scoped></style>
