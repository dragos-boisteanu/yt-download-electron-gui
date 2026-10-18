<script setup lang="ts">
import { CogIcon } from '@heroicons/vue/24/outline'
import { vRipple } from '@/directives/vRipple'
import DialogComponent from '@/components/dialogComponent.vue'
import { ref } from 'vue'
import YtDlBinPathSettingComponent from '@/components/settings/ytDlBinPathSettingComponent.vue'

const showSettingsDialog = ref<boolean>(false)
const toggleShowSettingsDialog = () => {
  showSettingsDialog.value = !showSettingsDialog.value
}
</script>

<template>
  <div class="[-webkit-app-region:no-drag]">
    <button
      @click="toggleShowSettingsDialog()"
      v-ripple
      class="inset-shadow cursor-pointer rounded-full p-2 transition-colors ease-in-out hover:bg-zinc-100 active:bg-zinc-200"
    >
      <CogIcon class="size-5" />
    </button>

    <dialog-component v-if="showSettingsDialog" @close="toggleShowSettingsDialog()">
      <template #title>Settings</template>
      <template #default> <yt-dl-bin-path-setting-component /></template>
    </dialog-component>
  </div>
</template>

<style scoped></style>
