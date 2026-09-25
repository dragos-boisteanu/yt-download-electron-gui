<script setup lang="ts">
import { CogIcon } from '@heroicons/vue/24/outline'
import { vRipple } from '@/directives/vRipple'
</script>

<template>
  <button
    v-ripple
    class="inset-shadow rounded-lg p-2 transition-colors ease-in-out [-webkit-app-region:no-drag] hover:bg-zinc-100 active:bg-zinc-200"
  >
    <CogIcon class="size-5" />
  </button>
</template>

<style scoped></style>
