<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/solid'
import { StopIcon, MinusIcon, Square2StackIcon } from '@heroicons/vue/24/outline'
import { vRipple } from '@/directives/vRipple'

const props = defineProps<{
  isMaximized: boolean
}>()

const closeApp = () => {
  const bridge = (window as any).bridge
  if (!bridge) {
    return
  }

  bridge.closeApp()
}

const minimize = () => {
  const bridge = (window as any).bridge
  if (!bridge) {
    return
  }

  bridge.minimize()
}

const toggleFullScreen = () => {
  const bridge = (window as any).bridge
  if (!bridge) {
    return
  }

  bridge.toggleFullScreen(props.isMaximized)
}
</script>

<template>
  <div class="flex items-center justify-end gap-x-2 [-webkit-app-region:no-drag]">
    <button
      @click="minimize"
      v-ripple
      class="inset-shadow rounded-lg p-2 transition-colors ease-in-out hover:bg-zinc-100 active:bg-zinc-200"
    >
      <MinusIcon class="size-5" />
    </button>

    <button
      v-ripple
      @click="toggleFullScreen"
      class="inset-shadow rounded-lg p-2 transition-colors ease-in-out hover:bg-zinc-100 active:bg-zinc-200"
    >
      <Square2StackIcon v-if="props.isMaximized" class="size-5" />
      <StopIcon v-else class="size-5" />
    </button>

    <button
      @click="closeApp"
      v-ripple
      class="inset-shadow rounded-lg p-2 transition-colors ease-in-out hover:bg-zinc-100 active:bg-zinc-200"
    >
      <XMarkIcon class="size-5" />
    </button>
  </div>
</template>

<style scoped></style>
