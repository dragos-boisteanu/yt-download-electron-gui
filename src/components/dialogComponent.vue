<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { vRipple } from '@/directives/vRipple'

const emits = defineEmits<{
  (e: 'close'): void
}>()

const close = () => {
  emits('close')
}
</script>

<template>
  <div
    class="fixed top-0 left-0 z-10 flex size-full items-center justify-center overflow-hidden bg-black/50 backdrop-blur"
  >
    <div
      class="w-[90%] max-w-lg rounded-2xl bg-neutral-50 shadow-2xl md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl"
    >
      <div class="flex items-center justify-between p-4">
        <div class="text-xl font-semibold text-neutral-800 dark:text-gray-300">
          <slot name="title"></slot>
        </div>

        <button
          v-ripple
          class="cursor-pointer rounded-full p-2 text-neutral-800 hover:bg-neutral-300/30 active:scale-95 active:bg-neutral-300/20 dark:text-gray-300 dark:hover:bg-neutral-500/10 dark:active:bg-neutral-500/20"
          @click="close()"
        >
          <XMarkIcon class="size-5" />
        </button>
      </div>

      <div class="text-md text-neutral-800 dark:border-neutral-600 dark:text-gray-300">
        <slot />
      </div>

      <div class="0 flex items-center justify-end gap-x-4 px-4 py-2">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
