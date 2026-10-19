<script setup lang="ts">
import { vRipple } from '@/directives/vRipple'
import { ref } from 'vue'

const ytDlpPath = ref<string>('')

const openFilePicker = async () => {
  const bridge = (window as any).bridge
  if (!bridge) {
    return
  }

  const path = await bridge.setYtDlpPath()
  if (path) {
    ytDlpPath.value = path
  }
}

const getYtDlpPath = async () => {
  const bridge = (window as any).bridge
  if (!bridge) {
    return
  }

  ytDlpPath.value = await bridge.getYtDlpPath()
}
getYtDlpPath()
</script>

<template>
  <div class="flex w-full items-center justify-between p-4">
    <div>
      <div class="font-semibold text-neutral-700">yt-dlp Executable</div>
      <div class="text-sm text-neutral-600">
        Select the location of the yt-dlp.exe file on your computer.
      </div>
      <div v-if="ytDlpPath" class="text-xs text-neutral-600">
        <span class="pr-1 font-semibold">Current path:</span>
        <span>{{ ytDlpPath }}</span>
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
