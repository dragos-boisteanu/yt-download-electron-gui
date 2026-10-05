<script setup lang="ts">
const openFilePicker = async () => {
  const bridge = (window as any).bridge
  if (!bridge) {
    return
  }

  await bridge.setYtDlpPath()
}

const handleFileChange = (e: Event) => {}
</script>

<template>
  <input ref="filePicker" type="file" style="display: none" @change="handleFileChange" />
  <div class="flex w-full items-center justify-between">
    <div>
      <div class="font-semibold">Yt-dl path</div>
      <div>Select the path were the yt-dl executable is located.</div>
    </div>
    <div>
      <button @click="openFilePicker()">Browse...</button>
    </div>
  </div>
</template>

<style scoped></style>
